const { fail } = require('../utils/response');

const role = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return fail(res, 'Not authenticated', 401);
    if (!allowedRoles.includes(req.user.role)) {
      return fail(res, 'Forbidden: insufficient role', 403);
    }
    next();
  };
};

module.exports = role;
