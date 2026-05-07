const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail, AppError } = require('../utils/response');

const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, city, occupation } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError('Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    phone: phone || '',
    city: city || '',
    occupation: occupation || '',
    role: 'user',
    status: 'active',
  });

  // Auto-create wallet
  await Wallet.create({ userId: user._id, balance: 0, currency: 'PKR' });

  await Notification.create({
    userId: user._id,
    title: 'Welcome to Dukandaar DAO',
    message: 'Your wallet has been created. Add funds to start investing in fractional real estate.',
    type: 'account',
  });

  const token = signToken(user);
  return ok(res, { user: user.toSafeJSON(), token }, 'Registered successfully', 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) return fail(res, 'Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return fail(res, 'Invalid credentials', 401);

  user.lastLogin = new Date();
  await user.save();

  const token = signToken(user);
  return ok(res, { user: user.toSafeJSON(), token }, 'Login successful');
});

exports.logout = asyncHandler(async (req, res) => {
  // JWT is stateless. Frontend must drop the token. This endpoint exists for symmetry.
  return ok(res, {}, 'Logged out');
});

exports.me = asyncHandler(async (req, res) => {
  return ok(res, { user: req.user.toSafeJSON() });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404);

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return fail(res, 'Current password incorrect', 401);

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordChangedAt = new Date();
  await user.save();
  return ok(res, {}, 'Password changed');
});
