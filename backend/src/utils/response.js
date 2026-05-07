const ok = (res, data = {}, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

const fail = (res, message = 'Request failed', status = 400, errors = null) => {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
};

class AppError extends Error {
  constructor(message, statusCode = 400, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }
}

module.exports = { ok, fail, AppError };
