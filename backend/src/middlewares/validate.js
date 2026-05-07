const mongoose = require('mongoose');
const { fail } = require('../utils/response');

const validateBody = (schemaFn) => (req, res, next) => {
  const errors = schemaFn(req.body || {});
  if (errors.length > 0) {
    return fail(res, 'Validation failed', 422, errors);
  }
  next();
};

const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const value = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return fail(res, `Invalid ${paramName}`, 400);
  }
  next();
};

module.exports = { validateBody, validateObjectId };
