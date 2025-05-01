/**
 * Authentication Service
 * Handles business logic for authentication
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ResourceExistsError, AuthenticationError } = require('../utils/errorHandler');

/**
 * Register a new user
 */
const registerUser = async ({ username, email, password, role }) => {
  // Check if user already exists
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new ResourceExistsError('Email is already in use');
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  // Create user
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role: role || 'user' // Default to 'user' if not specified
  });

  // Generate JWT
  const token = generateToken(user);

  // Return user data (excluding password) and token
  return {
    message: 'User created successfully',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  };
};

/**
 * Login a user
 */
const loginUser = async ({ email, password }) => {
  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Generate JWT
  const token = generateToken(user);

  // Return user data (excluding password) and token
  return {
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  };
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Verify a token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyToken
};
