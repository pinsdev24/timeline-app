/**
 * Error Handler Utility
 * Custom error classes and middleware for handling errors
 */

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Not authorized to access this resource') {
    super(message, 403);
  }
}

class ServiceError extends AppError {
  constructor(message = 'External service error') {
    super(message, 502);
  }
}

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log error for debugging in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    console.error('ERROR 💥:', err);
  }

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let status = err.status || 'error';

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = err.errors.map(e => e.message).join(', ');
    status = 'fail';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
    status = 'fail';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
    status = 'fail';
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ServiceError,
  errorHandler
};
