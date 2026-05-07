const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/response');

exports.list = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const filter = { isActive: true };
  if (type) filter.type = type;
  const items = await Category.find(filter).sort({ name: 1 });
  return ok(res, { items });
});

exports.adminList = asyncHandler(async (req, res) => {
  const items = await Category.find({}).sort({ type: 1, name: 1 });
  return ok(res, { items });
});

exports.adminCreate = asyncHandler(async (req, res) => {
  const { name, type, description } = req.body;
  if (!name || !type) return fail(res, 'name and type are required', 422);
  const exists = await Category.findOne({ name: name.trim(), type });
  if (exists) return fail(res, 'Category with this name and type already exists', 409);
  const cat = await Category.create({
    name: name.trim(),
    type,
    description: description || '',
    createdBy: req.user._id,
  });
  return ok(res, { category: cat }, 'Category created', 201);
});

exports.adminUpdate = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return fail(res, 'Category not found', 404);
  const allowed = ['name', 'description', 'isActive'];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) cat[k] = req.body[k];
  });
  await cat.save();
  return ok(res, { category: cat }, 'Category updated');
});

exports.adminDisable = asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!cat) return fail(res, 'Category not found', 404);
  return ok(res, { category: cat }, 'Category disabled');
});
