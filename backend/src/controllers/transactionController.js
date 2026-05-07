const Transaction = require('../models/Transaction');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/response');

exports.list = asyncHandler(async (req, res) => {
  const { type, status, category, dateFrom, dateTo, search, page = 1, limit = 20 } = req.query;
  const filter = {
    $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
  };
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }
  if (search) {
    filter.$and = [
      { $or: filter.$or },
      {
        $or: [
          { transactionId: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      },
    ];
    delete filter.$or;
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

exports.getOne = asyncHandler(async (req, res) => {
  const tx = await Transaction.findById(req.params.id)
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email')
    .populate('propertyId', 'title city');
  if (!tx) return fail(res, 'Transaction not found', 404);

  const isOwner =
    (tx.senderId && tx.senderId._id.toString() === req.user._id.toString()) ||
    (tx.receiverId && tx.receiverId._id.toString() === req.user._id.toString());
  if (!isOwner && req.user.role !== 'admin') return fail(res, 'Forbidden', 403);

  return ok(res, { transaction: tx });
});

exports.receipt = asyncHandler(async (req, res) => {
  const tx = await Transaction.findById(req.params.id)
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email')
    .populate('propertyId', 'title city pricePerShare');
  if (!tx) return fail(res, 'Transaction not found', 404);

  const isOwner =
    (tx.senderId && tx.senderId._id.toString() === req.user._id.toString()) ||
    (tx.receiverId && tx.receiverId._id.toString() === req.user._id.toString());
  if (!isOwner && req.user.role !== 'admin') return fail(res, 'Forbidden', 403);

  return ok(res, {
    receipt: {
      transactionId: tx.transactionId,
      type: tx.type,
      status: tx.status,
      amount: tx.amount,
      sender: tx.senderId,
      receiver: tx.receiverId,
      property: tx.propertyId,
      description: tx.description,
      suspiciousFlag: tx.suspiciousFlag,
      suspiciousReasons: tx.suspiciousReasons,
      createdAt: tx.createdAt,
    },
  });
});

exports.monthlySummary = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const filter = {
    $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    createdAt: { $gte: start },
    status: { $in: ['successful', 'flagged'] },
  };

  const list = await Transaction.find(filter);
  const summary = {
    deposits: 0,
    withdrawals: 0,
    transfersIn: 0,
    transfersOut: 0,
    investments: 0,
    dividends: 0,
    count: list.length,
  };
  for (const t of list) {
    if (t.type === 'deposit' && t.receiverId?.toString() === req.user._id.toString()) summary.deposits += t.amount;
    if (t.type === 'withdrawal' && t.senderId?.toString() === req.user._id.toString()) summary.withdrawals += t.amount;
    if (t.type === 'transfer' && t.senderId?.toString() === req.user._id.toString()) summary.transfersOut += t.amount;
    if (t.type === 'transfer' && t.receiverId?.toString() === req.user._id.toString()) summary.transfersIn += t.amount;
    if (t.type === 'investment' && t.senderId?.toString() === req.user._id.toString()) summary.investments += t.amount;
    if (t.type === 'dividend' && t.receiverId?.toString() === req.user._id.toString()) summary.dividends += t.amount;
  }
  return ok(res, { summary });
});
