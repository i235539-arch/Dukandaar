const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/response');

const calcStatus = (spent, total, threshold) => {
  if (total <= 0) return 'safe';
  const ratio = (spent / total) * 100;
  if (ratio >= 100) return 'exceeded';
  if (ratio >= threshold) return 'nearLimit';
  return 'safe';
};

const monthRange = (month) => {
  const start = new Date(`${month}-01T00:00:00Z`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
};

exports.create = asyncHandler(async (req, res) => {
  const { month, totalLimit, categoryLimits = [], warningThreshold = 80 } = req.body;
  const existing = await Budget.findOne({ userId: req.user._id, month });
  if (existing) return fail(res, 'Budget already exists for this month, use update', 409);

  const { start, end } = monthRange(month);
  const expenses = await Expense.find({ userId: req.user._id, date: { $gte: start, $lt: end } });
  const spent = expenses.reduce((s, e) => s + e.amount, 0);

  const status = calcStatus(spent, Number(totalLimit), Number(warningThreshold));

  const budget = await Budget.create({
    userId: req.user._id,
    month,
    totalLimit: Number(totalLimit),
    categoryLimits,
    spentAmount: spent,
    warningThreshold: Number(warningThreshold),
    status,
  });
  return ok(res, { budget }, 'Budget created', 201);
});

exports.list = asyncHandler(async (req, res) => {
  const items = await Budget.find({ userId: req.user._id }).sort({ month: -1 });
  return ok(res, { items });
});

exports.current = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const budget = await Budget.findOne({ userId: req.user._id, month });
  if (!budget) return ok(res, { budget: null, month });

  const { start, end } = monthRange(month);
  const expenses = await Expense.find({ userId: req.user._id, date: { $gte: start, $lt: end } });
  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  budget.spentAmount = spent;
  budget.status = calcStatus(spent, budget.totalLimit, budget.warningThreshold);
  await budget.save();

  // Per-category spend
  const perCategory = {};
  for (const e of expenses) {
    perCategory[e.category] = (perCategory[e.category] || 0) + e.amount;
  }

  return ok(res, { budget, perCategory, month });
});

exports.update = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id);
  if (!budget) return fail(res, 'Budget not found', 404);
  if (budget.userId.toString() !== req.user._id.toString()) return fail(res, 'Forbidden', 403);

  const allowed = ['totalLimit', 'categoryLimits', 'warningThreshold'];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) budget[k] = req.body[k];
  });
  if (Number(budget.totalLimit) <= 0) return fail(res, 'totalLimit must be > 0', 400);

  budget.status = calcStatus(budget.spentAmount, budget.totalLimit, budget.warningThreshold);
  await budget.save();
  return ok(res, { budget }, 'Budget updated');
});

exports.remove = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id);
  if (!budget) return fail(res, 'Budget not found', 404);
  if (budget.userId.toString() !== req.user._id.toString()) return fail(res, 'Forbidden', 403);
  await budget.deleteOne();
  return ok(res, {}, 'Budget deleted');
});
