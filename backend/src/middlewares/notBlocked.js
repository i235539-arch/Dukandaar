const { fail } = require('../utils/response');

const notBlocked = (req, res, next) => {
  if (req.user && req.user.status === 'blocked') {
    return fail(res, 'Your account is blocked. Financial actions are not allowed.', 403);
  }
  next();
};

module.exports = notBlocked;
