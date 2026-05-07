const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Investment = require('../models/Investment');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');

exports.userDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const wallet = await Wallet.findOne({ userId });

  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  const [recent, monthExpenses, investments] = await Promise.all([
    Transaction.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('propertyId', 'title')
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email'),
    Expense.find({ userId, date: { $gte: start, $lt: end } }),
    Investment.find({ userId, status: 'active' }).populate('propertyId', 'title city'),
  ]);

  const monthExpenseTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalInvested = investments.reduce((s, i) => s + i.amountInvested, 0);
  const totalDividends = investments.reduce((s, i) => s + i.totalDividendsReceived, 0);

  return ok(res, {
    wallet,
    recentTransactions: recent,
    monthExpenseTotal,
    activeInvestmentsCount: investments.length,
    totalInvested,
    totalDividends,
  });
});

exports.incomeExpense = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const months = 6;
  const result = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;

    const [txs, exps] = await Promise.all([
      Transaction.find({
        receiverId: userId,
        type: { $in: ['deposit', 'transfer', 'dividend'] },
        status: { $in: ['successful', 'flagged'] },
        createdAt: { $gte: start, $lt: end },
      }),
      Expense.find({ userId, date: { $gte: start, $lt: end } }),
    ]);

    const income = txs.reduce((s, t) => s + t.amount, 0);
    const expense = exps.reduce((s, e) => s + e.amount, 0);
    result.push({ month: label, income, expense });
  }
  return ok(res, { series: result });
});

exports.budgetUsage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const budgets = await Budget.find({ userId }).sort({ month: -1 }).limit(6);
  const series = budgets
    .map((b) => ({
      month: b.month,
      totalLimit: b.totalLimit,
      spent: b.spentAmount,
      status: b.status,
    }))
    .reverse();
  return ok(res, { series });
});
