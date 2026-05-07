const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/response');
const notify = require('../utils/notify');

const recalcBudgetStatus = async (userId, date) => {
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const budget = await Budget.findOne({ userId, month });
  if (!budget) return null;

  const monthStart = new Date(`${month}-01T00:00:00Z`);
  const nextMonth = new Date(monthStart);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const expenses = await Expense.find({
    userId,
    date: { $gte: monthStart, $lt: nextMonth },
  });
  const spent = expenses.reduce((s, e) => s + e.amount, 0);

  budget.spentAmount = spent;
  const ratio = (spent / budget.totalLimit) * 100;
  if (ratio >= 100) budget.status = 'exceeded';
  else if (ratio >= budget.warningThreshold) budget.status = 'nearLimit';
  else budget.status = 'safe';
  await budget.save();

  // Trigger one alert per status transition (simple version)
  if (budget.status === 'nearLimit') {
    await notify({
      userId,
      title: 'Budget warning',
      message: `You have spent ${ratio.toFixed(0)}% of your monthly budget for ${month}.`,
      type: 'budget',
    });
  } else if (budget.status === 'exceeded') {
    await notify({
      userId,
      title: 'Budget exceeded',
      message: `You have exceeded your monthly budget for ${month}.`,
      type: 'budget',
    });
  }

  return budget;
};

exports.create = asyncHandler(async (req, res) => {
  const { title, amount, category, paymentMethod, date, notes } = req.body;
  const expense = await Expense.create({
    userId: req.user._id,
    title,
    amount: Number(amount),
    category,
    paymentMethod: paymentMethod || 'Wallet',
    date: date ? new Date(date) : new Date(),
    notes: notes || '',
  });

  await recalcBudgetStatus(req.user._id, expense.date);

  return ok(res, { expense }, 'Expense added', 201);
});

exports.list = asyncHandler(async (req, res) => {
  const { category, dateFrom, dateTo, search, page = 1, limit = 20 } = req.query;
  const filter = { userId: req.user._id };
  if (category) filter.category = category;
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }
  if (search) filter.title = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Expense.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
    Expense.countDocuments(filter),
  ]);
  return ok(res, { items, total, page: Number(page), limit: Number(limit) });
});

exports.update = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return fail(res, 'Expense not found', 404);
  if (expense.userId.toString() !== req.user._id.toString()) {
    return fail(res, 'Forbidden', 403);
  }
  const allowed = ['title', 'amount', 'category', 'paymentMethod', 'date', 'notes'];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) {
      expense[k] = k === 'date' ? new Date(req.body[k]) : req.body[k];
    }
  });
  if (Number(expense.amount) <= 0) return fail(res, 'Amount must be > 0', 400);
  await expense.save();
  await recalcBudgetStatus(req.user._id, expense.date);
  return ok(res, { expense }, 'Expense updated');
});

exports.remove = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return fail(res, 'Expense not found', 404);
  if (expense.userId.toString() !== req.user._id.toString()) {
    return fail(res, 'Forbidden', 403);
  }
  const date = expense.date;
  await expense.deleteOne();
  await recalcBudgetStatus(req.user._id, date);
  return ok(res, {}, 'Expense deleted');
});

exports.monthlySummary = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  const expenses = await Expense.find({
    userId: req.user._id,
    date: { $gte: start, $lt: end },
  });
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  return ok(res, {
    month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
    total,
    count: expenses.length,
  });
});

exports.categorySummary = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  const result = await Expense.aggregate([
    { $match: { userId: req.user._id, date: { $gte: start, $lt: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);
  return ok(res, { categories: result });
});
