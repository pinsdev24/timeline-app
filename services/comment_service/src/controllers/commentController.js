/**
 * Comment Controller
 * Handles HTTP requests for comment operations
 */
const commentService = require('../services/commentService');
const { validateComment, validateCommentId } = require('../utils/validators');
const { ValidationError } = require('../utils/errorHandler');

/**
 * Create a new comment
 * @route POST /comments
 */
const createComment = async (req, res, next) => {
  try {
    const validationErrors = validateComment(req.body);
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.join(', '));
    }

    const { content, userId, event_id } = req.body;
    const comment = await commentService.createComment({
      content,
      userId,
      event_id
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all comments (admin/moderator only)
 * @route GET /comments
 */
const getAllComments = async (req, res, next) => {
  try {
    const comments = await commentService.getAllComments();
    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get approved comments
 * @route GET /comments/approved
 */
const getApprovedComments = async (req, res, next) => {
  try {
    const comments = await commentService.getApprovedComments();
    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending comments (not yet approved)
 * @route GET /comments/pending
 */
const getPendingComments = async (req, res, next) => {
  try {
    const comments = await commentService.getPendingComments();
    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comments for a specific event
 * @route GET /comments/event/:eventId
 */
const getCommentsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    if (!eventId || isNaN(parseInt(eventId))) {
      throw new ValidationError('Valid event ID is required');
    }
    
    // Default to approved only for regular users, all comments for moderators/admins
    const approvedOnly = !req.user || !['moderator', 'admin'].includes(req.user.role);
    const comments = await commentService.getCommentsByEvent(eventId, approvedOnly);
    
    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a comment
 * @route PUT /comments/:id/approve
 */
const approveComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validationErrors = validateCommentId(id);
    
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.join(', '));
    }
    
    const comment = await commentService.approveComment(id);
    
    res.status(200).json({
      success: true,
      message: 'Comment approved successfully',
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete/reject a comment
 * @route DELETE /comments/:id
 */
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validationErrors = validateCommentId(id);
    
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.join(', '));
    }
    
    await commentService.rejectComment(id);
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getAllComments,
  getApprovedComments,
  getPendingComments,
  getCommentsByEvent,
  approveComment,
  deleteComment
};
