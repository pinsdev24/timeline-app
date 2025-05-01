/**
 * Validation Utilities
 * Common validation functions and helpers
 */
const { ValidationError } = require('./errorHandler');

// Helper function to validate and parse integer ID
const validateAndParseIntId = (idParam, paramName) => {
  const id = parseInt(idParam, 10);
  if (isNaN(id) || id <= 0) {
    throw new ValidationError(`Invalid ${paramName} format: Must be a positive integer`);
  }
  return id;
};

/**
 * Validate media type
 * @param {string} type - Media type to validate
 * @returns {boolean} True if valid media type, false otherwise
 */
const isValidMediaType = (type) => {
  return ['image', 'video', 'text'].includes(type);
};

/**
 * Validate file type based on MIME type
 * @param {string} mimetype - MIME type to validate
 * @returns {boolean} True if valid file type, false otherwise
 */
const isValidFileType = (mimetype) => {
  const allowedImageTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp'
  ];
  
  const allowedVideoTypes = [
    'video/mp4', 
    'video/webm', 
    'video/quicktime'
  ];
  
  return [...allowedImageTypes, ...allowedVideoTypes].includes(mimetype);
};

/**
 * Validate file size (max 10MB)
 * @param {number} size - File size in bytes
 * @returns {boolean} True if valid file size, false otherwise
 */
const isValidFileSize = (size) => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  return size <= MAX_SIZE;
};

/**
 * Generate the appropriate media type based on MIME type
 * @param {string} mimetype - MIME type
 * @returns {string} Media type ('image', 'video', or 'text')
 */
const getMediaTypeFromMimetype = (mimetype) => {
  if (mimetype.startsWith('image/')) {
    return 'image';
  } else if (mimetype.startsWith('video/')) {
    return 'video';
  } else {
    return 'text';
  }
};

module.exports = {
  validateAndParseIntId,
  isValidMediaType,
  isValidFileType,
  isValidFileSize,
  getMediaTypeFromMimetype
};
