/**
 * Authentication Routes
 * Handles all authentication-related endpoints
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, checkTokenValidity } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/check-token
 * @desc    Verify if token is valid
 * @access  Public
 */
router.get('/check-token', checkTokenValidity, authController.verifyToken);

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile data
 * @access  Private
 */
router.get('/profile', authenticateToken, (req, res) => {
  // User data is attached to req.user by the authenticateToken middleware
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role
  });
});

module.exports = router;
