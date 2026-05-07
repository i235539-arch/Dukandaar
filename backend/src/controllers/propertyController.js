const Property = require('../models/Property');
const Investment = require('../models/Investment');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail, AppError } = require('../utils/response');
const generateTransactionId = require('../utils/transactionId');
const suspicious = require('../utils/suspiciousRules');
const notify = require('../utils/notify');

exports.listPublic = asyncHandler(async (req, res) => {
  const { city, propertyType, status = 'open', search, page = 1, limit = 12 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (city) filter.city = { $regex: city, $options: 'i' };
  if (propertyType) filter.propertyType = propertyType;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Property.countDocuments(filter),
  ]);

  return ok(res, { items, total, page: Number(page), limit: Number(limit) });
});

exports.getById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return fail(res, 'Property not found', 404);
  return ok(res, { property });
});

exports.invest = asyncHandler(async (req, res) => {
  const shares = Number(req.body.shares);
  const property = await Property.findById(req.params.id);
  if (!property) return fail(res, 'Property not found', 404);
  if (property.status !== 'open') return fail(res, 'Property is not open for investment', 400);
  if (shares < property.minSharesPerInvestor) {
    return fail(res, `Minimum ${property.minSharesPerInvestor} share(s) required`, 400);
  }
  if (shares > property.sharesAvailable) {
    return fail(res, `Only ${property.sharesAvailable} share(s) available`, 400);
  }

  const amount = shares * property.pricePerShare;

  const wallet = await Wallet.findOne({ userId: req.user._id });
  if (!wallet) throw new AppError('Wallet not found', 404);
  if (wallet.status !== 'active') return fail(res, 'Your wallet is frozen', 403);
  if (wallet.balance < amount) {
    const failedTx = await Transaction.create({
      transactionId: generateTransactionId(),
      senderId: req.user._id,
      propertyId: property._id,
      amount,
      type: 'investment',
      status: 'failed',
      description: `Investment in ${property.title} (failed)`,
      failureReason: 'Insufficient balance',
    });
    return fail(res, 'Insufficient balance to invest', 400);
  }

  const susp = await suspicious.evaluate({ user: req.user, type: 'investment', amount });
  const status = susp.suspiciousFlag ? 'flagged' : 'successful';

  // Update wallet
  wallet.balance -= amount;
  wallet.totalInvested += amount;
  await wallet.save();

  // Update property
  property.sharesAvailable -= shares;
  if (property.sharesAvailable === 0) property.status = 'funded';
  await property.save();

  // Record investment
  const ownershipPercent = (shares / property.totalShares) * 100;
  const txId = generateTransactionId();

  const investment = await Investment.create({
    userId: req.user._id,
    propertyId: property._id,
    shares,
    pricePerShareAtPurchase: property.pricePerShare,
    amountInvested: amount,
    ownershipPercent,
    transactionId: txId,
  });

  const tx = await Transaction.create({
    transactionId: txId,
    senderId: req.user._id,
    receiverId: null,
    propertyId: property._id,
    amount,
    type: 'investment',
    status,
    category: 'Investment',
    description: `Bought ${shares} share(s) of ${property.title}`,
    suspiciousFlag: susp.suspiciousFlag,
    suspiciousReasons: susp.reasons,
    metadata: { investmentId: investment._id, ownershipPercent },
  });

  await notify({
    userId: req.user._id,
    title: status === 'flagged' ? 'Investment flagged' : 'Investment successful',
    message: `You invested PKR ${amount.toLocaleString()} (${shares} shares) in ${property.title}.`,
    type: 'investment',
    relatedTransactionId: tx.transactionId,
    relatedPropertyId: property._id,
  });

  return ok(res, { wallet, property, investment, transaction: tx }, 'Investment recorded');
});

exports.myInvestments = asyncHandler(async (req, res) => {
  const items = await Investment.find({ userId: req.user._id })
    .populate('propertyId')
    .sort({ createdAt: -1 });
  const totalInvested = items.reduce((s, i) => s + i.amountInvested, 0);
  const totalDividends = items.reduce((s, i) => s + i.totalDividendsReceived, 0);
  return ok(res, { items, totalInvested, totalDividends });
});

// ---------------- ADMIN ----------------

exports.adminCreate = asyncHandler(async (req, res) => {
  const body = req.body;
  if (body.sharesAvailable === undefined) body.sharesAvailable = body.totalShares;
  body.createdBy = req.user._id;
  if (body.totalValue && body.totalShares && !body.pricePerShare) {
    body.pricePerShare = Number(body.totalValue) / Number(body.totalShares);
  }
  const property = await Property.create(body);
  return ok(res, { property }, 'Property created', 201);
});

exports.adminUpdate = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!property) return fail(res, 'Property not found', 404);
  return ok(res, { property }, 'Property updated');
});

exports.adminDelete = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndDelete(req.params.id);
  if (!property) return fail(res, 'Property not found', 404);
  return ok(res, {}, 'Property deleted');
});

exports.adminVerify = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { isVerified: true },
    { new: true }
  );
  if (!property) return fail(res, 'Property not found', 404);
  return ok(res, { property }, 'Property verified');
});

exports.adminPayDividend = asyncHandler(async (req, res) => {
  const totalDividend = Number(req.body.totalDividend);
  if (!totalDividend || totalDividend <= 0) return fail(res, 'totalDividend must be > 0', 400);

  const property = await Property.findById(req.params.id);
  if (!property) return fail(res, 'Property not found', 404);

  const investments = await Investment.find({ propertyId: property._id, status: 'active' });
  if (investments.length === 0) return fail(res, 'No active investors', 400);

  const sharesSold = property.totalShares - property.sharesAvailable;
  if (sharesSold === 0) return fail(res, 'No shares sold yet', 400);

  const created = [];
  for (const inv of investments) {
    const share = (inv.shares / sharesSold) * totalDividend;
    const wallet = await Wallet.findOne({ userId: inv.userId });
    if (!wallet) continue;

    wallet.balance += share;
    wallet.totalDividendsEarned += share;
    await wallet.save();

    inv.totalDividendsReceived += share;
    await inv.save();

    const tx = await Transaction.create({
      transactionId: generateTransactionId(),
      senderId: null,
      receiverId: inv.userId,
      propertyId: property._id,
      amount: Number(share.toFixed(2)),
      type: 'dividend',
      status: 'successful',
      category: 'Dividend',
      description: `Rental dividend from ${property.title}`,
    });

    await notify({
      userId: inv.userId,
      title: 'Dividend received',
      message: `PKR ${share.toFixed(2)} dividend credited from ${property.title}.`,
      type: 'investment',
      relatedTransactionId: tx.transactionId,
      relatedPropertyId: property._id,
    });

    created.push(tx._id);
  }

  return ok(res, { distributedTo: created.length, totalDividend }, 'Dividends paid');
});
