/**
 * Authentication Controller
 * Handles user authentication endpoints 
 */
const authService = require('../services/authService');
const { validateRegistration, validateLogin } = require('../utils/validators');
const { ValidationError } = require('../utils/errorHandler');

/**
 * User registration handler
 */
const register = async (req, res, next) => {
  // Validate input data first
  const validationErrors = validateRegistration(req.body);
  if (validationErrors.length > 0) {
    // Directly send 400 if validation fails
    return res.status(400).json({ errors: validationErrors });
  }
  
  try {
    // Proceed only if validation passed
    const { username, email, password, role } = req.body;
    const result = await authService.registerUser({ username, email, password, role });
    
    return res.status(201).json(result);
  } catch (error) {
    // Pass other errors (like from authService) to error handler
    next(error);
  }
};

/**
 * User login handler
 */
const login = async (req, res, next) => {
  // Validate input data first
  const validationErrors = validateLogin(req.body);
  if (validationErrors.length > 0) {
    // Directly send 400 if validation fails
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    // Proceed only if validation passed
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    
    return res.status(200).json(result);
  } catch (error) {
    // Pass other errors (like from authService) to error handler
    next(error);
  }
};

/**
 * Token verification handler
 */
const verifyToken = async (req, res) => {
  // The middleware has already verified the token if we reached here
  return res.json({ 
    valid: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
};

module.exports = {
  register,
  login,
  verifyToken
};
