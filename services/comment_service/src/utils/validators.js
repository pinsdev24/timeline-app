/**
 * Validators for comment service
 */

/**
 * Validate comment data
 * @param {Object} data - Comment data to validate
 * @returns {Array} - Array of error messages, empty if validation passes
 */
const validateComment = (data) => {
  const errors = [];
  const { content, userId, event_id } = data;

  // Content validation
  if (!content) {
    errors.push('Content is required');
  } else if (content.length < 3) {
    errors.push('Content must be at least 3 characters long');
  } else if (content.length > 1000) {
    errors.push('Content cannot exceed 1000 characters');
  }

  // User ID validation
  if (!userId) {
    errors.push('User ID is required');
  } else if (isNaN(parseInt(userId))) {
    errors.push('User ID must be a number');
  }

  // Event ID validation
  if (!event_id) {
    errors.push('Event ID is required');
  } else if (isNaN(parseInt(event_id))) {
    errors.push('Event ID must be a number');
  }

  return errors;
};

/**
 * Validate comment ID parameter
 * @param {String} id - Comment ID to validate
 * @returns {Array} - Array of error messages, empty if validation passes
 */
const validateCommentId = (id) => {
  const errors = [];

  if (!id) {
    errors.push('Comment ID is required');
  } else if (isNaN(parseInt(id))) {
    errors.push('Comment ID must be a number');
  }

  return errors;
};

module.exports = {
  validateComment,
  validateCommentId
};
