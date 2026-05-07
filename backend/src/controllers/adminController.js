const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Property = require('../models/Property');
const Investment = require('../models/Investment');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/response');
const notify = require('../utils/notify');

exports.dashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    blockedUsers,
    totalProperties,
    openProperties,
    fundedProperties,
    totalTransactions,
    flaggedTransactions,
    totalVolumeAgg,
    totalDemoBalanceAgg,
    totalInvestedAgg,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ status: 'active' }),
    User.countDocuments({ status: 'blocked' }),
    Property.countDocuments({}),
    Property.countDocuments({ status: 'open' }),
    Property.countDocuments({ status: 'funded' }),
    Transaction.countDocuments({}),
    Transaction.countDocuments({ suspiciousFlag: true }),
    Transaction.aggregate([
      { $match: { status: { $in: ['successful', 'flagged'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Wallet.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]),
    Wallet.aggregate([{ $group: { _id: null, total: { $sum: '$totalInvested' } } }]),
  ]);

  return ok(res, {
    totalUsers,
    activeUsers,
    blockedUsers,
    totalProperties,
    openProperties,
    fundedProperties,
    totalTransactions,
    flaggedTransactions,
    totalVolume: totalVolumeAgg[0]?.total || 0,
    totalDemoBalance: totalDemoBalanceAgg[0]?.total || 0,
    totalInvested: totalInvestedAgg[0]?.total || 0,
  });
});

exports.listUsers = asyncHandler(async (req, res) => {
  const { search, status, role, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  return ok(res, { items, total, page: Number(page), limit: Number(limit) });
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) return fail(res, 'User not found', 404);
  const wallet = await Wallet.findOne({ userId: user._id });
  return ok(res, { user, wallet });
});

exports.blockUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) return fail(res, 'User not found', 404);
  if (target.role === 'admin') return fail(res, 'Cannot block admin', 400);
  target.status = 'blocked';
  await target.save();

  await AuditLog.create({
    actorId: req.user._id,
    action: 'BLOCK_USER',
    targetType: 'user',
    targetId: target._id,
    details: { reason: req.body.reason || 'admin action' },
    ipAddress: req.ip,
  });

  await notify({
    userId: target._id,
    title: 'Account blocked',
    message: 'Your account has been blocked. Financial actions are disabled. Please contact support.',
    type: 'security',
  });

  return ok(res, { user: target.toSafeJSON() }, 'User blocked');
});

exports.unblockUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) return fail(res, 'User not found', 404);
  target.status = 'active';
  await target.save();

  await AuditLog.create({
    actorId: req.user._id,
    action: 'UNBLOCK_USER',
    targetType: 'user',
    targetId: target._id,
    ipAddress: req.ip,
  });

  await notify({
    userId: target._id,
    title: 'Account re-activated',
    message: 'Your account has been unblocked. Welcome back!',
    type: 'security',
  });

  return ok(res, { user: target.toSafeJSON() }, 'User unblocked');
});

exports.listWallets = asyncHandler(async (req, res) => {
  const wallets = await Wallet.find({}).populate('userId', 'name email status role').sort({ updatedAt: -1 });
  return ok(res, { items: wallets, total: wallets.length });
});

exports.listAllTransactions = asyncHandler(async (req, res) => {
  const { type, status, search, page = 1, limit = 25 } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { transactionId: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Transaction.find(filter)
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .populate('propertyId', 'title city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Transaction.countDocuments(filter),
  ]);
  return ok(res, { items, total, page: Number(page), limit: Number(limit) });
});

exports.flaggedTransactions = asyncHandler(async (req, res) => {
  const items = await Transaction.find({ suspiciousFlag: true })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email')
    .populate('propertyId', 'title')
    .sort({ createdAt: -1 })
    .limit(200);
  return ok(res, { items, total: items.length });
});

exports.transactionVolume = asyncHandler(async (req, res) => {
  const months = 6;
  const now = new Date();
  const series = [];
  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
    const agg = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end },
          status: { $in: ['successful', 'flagged'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    series.push({ month: label, total: agg[0]?.total || 0, count: agg[0]?.count || 0 });
  }
  return ok(res, { series });
});

exports.systemBalance = asyncHandler(async (req, res) => {
  const [walletAgg, investedAgg, dividendAgg] = await Promise.all([
    Wallet.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]),
    Wallet.aggregate([{ $group: { _id: null, total: { $sum: '$totalInvested' } } }]),
    Wallet.aggregate([{ $group: { _id: null, total: { $sum: '$totalDividendsEarned' } } }]),
  ]);
  return ok(res, {
    totalDemoBalance: walletAgg[0]?.total || 0,
    totalInvested: investedAgg[0]?.total || 0,
    totalDividendsPaid: dividendAgg[0]?.total || 0,
  });
});

exports.auditLogs = asyncHandler(async (req, res) => {
  const items = await AuditLog.find({}).populate('actorId', 'name email').sort({ createdAt: -1 }).limit(200);
  return ok(res, { items });
});
