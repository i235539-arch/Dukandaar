const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { fail } = require('../utils/response');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return fail(res, 'Authorization token missing', 401);
    }
    const token = header.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return fail(res, 'Token expired, please login again', 401);
      }
      return fail(res, 'Invalid authentication token', 401);
    }

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) return fail(res, 'User no longer exists', 401);

    if (user.status === 'blocked') {
      // Allow read-only "me" calls but block financial actions via separate guard.
      req.userBlocked = true;
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
