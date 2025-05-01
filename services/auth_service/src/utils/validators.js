/**
 * Validators for authentication inputs
 */

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validate registration data
 * @param {Object} data - Registration data to validate
 * @returns {Array} - Array of error messages, empty if validation passes
 */
const validateRegistration = (data) => {
  const errors = [];
  const { username, email, password, role } = data;

  // Username validation
  if (!username) {
    errors.push('Username is required');
  } else if (username.length < 3 || username.length > 50) {
    errors.push('Username must be between 3 and 50 characters');
  }

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('Email is invalid');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  // Role validation (optional field)
  if (role && !['user', 'moderator', 'admin', 'researcher', 'curator'].includes(role)) {
    errors.push('Invalid role');
  }

  return errors;
};

/**
 * Validate login data
 * @param {Object} data - Login data to validate
 * @returns {Array} - Array of error messages, empty if validation passes
 */
const validateLogin = (data) => {
  const errors = [];
  const { email, password } = data;

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('Email is invalid');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  }

  return errors;
};

module.exports = {
  validateRegistration,
  validateLogin
};
