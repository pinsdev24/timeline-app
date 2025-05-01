/**
 * Comment Service
 * Handles business logic for comment operations
 */
const Comment = require('../models/Comment');
const { NotFoundError } = require('../utils/errorHandler');

/**
 * Create a new comment
 * @param {Object} commentData - Comment data
 * @returns {Object} - Created comment
 */
const createComment = async (commentData) => {
  return await Comment.create(commentData);
};

/**
 * Get all comments regardless of approval status
 * @returns {Array} - All comments
 */
const getAllComments = async () => {
  return await Comment.findAll();
};

/**
 * Get all approved comments
 * @returns {Array} - Approved comments
 */
const getApprovedComments = async () => {
  return await Comment.findAll({ where: { isApproved: true } });
};

/**
 * Get all pending comments (not approved)
 * @returns {Array} - Pending comments
 */
const getPendingComments = async () => {
  return await Comment.findAll({ where: { isApproved: false } });
};

/**
 * Get comments for a specific event
 * @param {Number} eventId - ID of the event
 * @param {Boolean} approvedOnly - Whether to return only approved comments
 * @returns {Array} - Comments for the event
 */
const getCommentsByEvent = async (eventId, approvedOnly = true) => {
  const whereClause = { event_id: eventId };
  
  if (approvedOnly) {
    whereClause.isApproved = true;
  }
  
  return await Comment.findAll({ where: whereClause });
};

/**
 * Approve a comment
 * @param {Number} commentId - ID of the comment to approve
 * @returns {Object} - Updated comment
 */
const approveComment = async (commentId) => {
  const comment = await Comment.findByPk(commentId);
  
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }
  
  // The update method returns the updated instance(s)
  // Return the result of the update call directly
  const updatedComment = await comment.update({ isApproved: true });
  return updatedComment;
};

/**
 * Reject a comment (delete it)
 * @param {Number} commentId - ID of the comment to reject
 * @returns {Boolean} - Success status
 */
const rejectComment = async (commentId) => {
  const comment = await Comment.findByPk(commentId);
  
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }
  
  await comment.destroy();
  return true;
};

/**
 * Get a comment by ID
 * @param {Number} commentId - ID of the comment to retrieve
 * @returns {Object} - Comment object
 */
const getCommentById = async (commentId) => {
  const comment = await Comment.findByPk(commentId);
  
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }
  
  return comment;
};

module.exports = {
  createComment,
  getAllComments,
  getApprovedComments,
  getPendingComments,
  getCommentsByEvent,
  approveComment,
  rejectComment,
  getCommentById
};
