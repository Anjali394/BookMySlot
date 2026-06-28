const ApiError = require('../utils/ApiError');
const { NODE_ENV } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Prisma known errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this value already exists';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  const response = {
    success: false,
    statusCode,
    message,
    ...(errors.length && { errors }),
    ...(NODE_ENV === 'development' && !err.isOperational && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
