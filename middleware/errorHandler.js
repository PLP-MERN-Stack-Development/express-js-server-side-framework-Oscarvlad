const { 
  NotFoundError, 
  ValidationError, 
  AppError 
} = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  let error = err;

  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || 'Internal Server Error',
      error.statusCode || 500
    );
  }

  res.status(error.statusCode).json({
    error: {
      type: error.constructor.name,
      message: error.message,
      details: error.details || null,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };