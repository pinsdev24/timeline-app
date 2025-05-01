/**
 * Authentication Middleware
 * Verifies JWT tokens for protected routes
 */
const jwt = require('jsonwebtoken');
require('dotenv').config();
const config = require('../config');

/**
 * Middleware to authenticate JWT token
 * Adds user data to request object if token is valid
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract from Bearer token format

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware to restrict access by role
 * @param {Array} roles - Array of roles allowed to access the route
 */
const authorizeRoles = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    next();
  };
};

/**
 * Verify token with auth service
 * Used to validate tokens against the authentication service
 * @param {String} token - JWT token
 * @returns {Object|null} - User data or null if invalid
 */
const verifyTokenWithAuthService = async (token) => {
  try {
    const response = await fetch(`${config.services.auth}/api/auth/check-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.valid ? data.user : null;
  } catch (error) {
    console.error('Error verifying token with auth service:', error);
    return null;
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  verifyTokenWithAuthService
};
