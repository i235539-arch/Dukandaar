const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { ok, AppError } = require('../utils/response');

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  if (!user) throw new AppError('User not found', 404);
  return ok(res, { user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  // Whitelist of safe fields (role/status/balance NEVER updatable here)
  const allowed = ['name', 'phone', 'cnic', 'occupation', 'city', 'riskProfile'];
  const update = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) update[k] = req.body[k];
  });

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  }).select('-passwordHash');

  if (!user) throw new AppError('User not found', 404);
  return ok(res, { user }, 'Profile updated');
});
