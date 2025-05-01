/**
 * Authentication Middleware
 * Validates JWT tokens and protects routes
 */
const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorizationError } = require('../utils/errorHandler');
const fetch = require('node-fetch');

/**
 * Middleware to protect routes - verifies the JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const protect = async (req, res, next) => {
  try {
    // Get token from authorization header
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return next(new AuthenticationError('You are not logged in. Please log in to get access.'));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Invalid token. Please log in again.'));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Your token has expired. Please log in again.'));
    }
    
    next(error);
  }
};

/**
 * Middleware to restrict access to certain roles
 * @param {...String} roles - Roles that have access
 * @returns {Function} Middleware function
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AuthorizationError('You do not have permission to perform this action'));
    }
    
    next();
  };
};

/**
 * Middleware to verify token with auth service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyWithAuthService = async (req, res, next) => {
  try {
    // Get token from authorization header
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return next(new AuthenticationError('You are not logged in. Please log in to get access.'));
    }
    
    // Verify token with auth service
    const response = await fetch(`${process.env.AUTH_SERVICE_URL}/auth/check-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return next(new AuthenticationError('Invalid token or session expired. Please log in again.'));
    }
    
    // Add user info to request
    req.user = data.user;
    
    next();
  } catch (error) {
    return next(new AuthenticationError('Authentication failed. Please log in again.'));
  }
};

module.exports = {
  protect,
  restrictTo,
  verifyWithAuthService
};
