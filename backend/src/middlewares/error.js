const { fail } = require('../utils/response');

const notFound = (req, res, next) => {
  return fail(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err);
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return fail(res, 'Validation error', 422, errors);
  }

  if (err.name === 'CastError') {
    return fail(res, `Invalid ${err.path}`, 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return fail(res, `Duplicate value for ${field}`, 409);
  }

  if (err.isOperational) {
    return fail(res, err.message, err.statusCode || 400, err.errors);
  }

  return fail(res, err.message || 'Internal server error', 500);
};

module.exports = { notFound, errorHandler };
