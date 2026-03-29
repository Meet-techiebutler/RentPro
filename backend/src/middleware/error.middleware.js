const ApiError = require('../utils/ApiError');

const handleCastErrorDB = (err) => new ApiError(400, `Invalid ${err.path}: ${err.value}`);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new ApiError(409, `Duplicate value: '${value}' for field '${field}'. Please use another value.`);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new ApiError(400, `Validation failed: ${errors.join('. ')}`);
};

const handleJWTError = () => new ApiError(401, 'Invalid token. Please log in again.');
const handleJWTExpiredError = () => new ApiError(401, 'Token expired. Please log in again.');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.status,
    message: err.message,
    errors: err.errors,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
  } else {
    console.error('💥 UNEXPECTED ERROR:', err);
    res.status(500).json({ success: false, status: 'error', message: 'Something went wrong.' });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
