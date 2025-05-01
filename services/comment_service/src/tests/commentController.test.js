/**
 * Comment Controller Tests
 */
const { describe, it, expect, beforeEach, jest: jestObject } = require('@jest/globals');
const commentController = require('../controllers/commentController');
const commentService = require('../services/commentService');
const { ValidationError, NotFoundError } = require('../utils/errorHandler');

// Mock dependencies
jest.mock('../services/commentService');

describe('Comment Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next function
    req = {
      body: {},
      params: {},
      user: {
        id: 1,
        role: 'user'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('createComment', () => {
    it('should create a comment successfully with valid input', async () => {
      // Arrange
      const commentData = {
        content: 'Test comment',
        userId: 1,
        event_id: 2
      };
      
      req.body = commentData;
      
      const mockComment = {
        id: 1,
        ...commentData,
        isApproved: false
      };
      
      commentService.createComment.mockResolvedValue(mockComment);
      
      // Act
      await commentController.createComment(req, res, next);
      
      // Assert
      expect(commentService.createComment).toHaveBeenCalledWith(commentData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Comment added successfully',
        data: mockComment
      });
    });
    
    it('should pass validation error to next middleware if input is invalid', async () => {
      // Arrange
      req.body = { content: '', userId: 'abc' }; // Invalid input
      
      // Act
      await commentController.createComment(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });
  });

  describe('getAllComments', () => {
    it('should return all comments', async () => {
      // Arrange
      const mockComments = [
        { id: 1, content: 'Comment 1', userId: 1, event_id: 1 },
        { id: 2, content: 'Comment 2', userId: 2, event_id: 1 }
      ];
      
      commentService.getAllComments.mockResolvedValue(mockComments);
      
      // Act
      await commentController.getAllComments(req, res, next);
      
      // Assert
      expect(commentService.getAllComments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockComments
      });
    });
    
    it('should handle errors appropriately', async () => {
      // Arrange
      const error = new Error('Test error');
      commentService.getAllComments.mockRejectedValue(error);
      
      // Act
      await commentController.getAllComments(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('getApprovedComments', () => {
    it('should return approved comments', async () => {
      // Arrange
      const mockComments = [
        { id: 1, content: 'Comment 1', userId: 1, event_id: 1, isApproved: true }
      ];
      
      commentService.getApprovedComments.mockResolvedValue(mockComments);
      
      // Act
      await commentController.getApprovedComments(req, res, next);
      
      // Assert
      expect(commentService.getApprovedComments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockComments
      });
    });
  });
  
  describe('getPendingComments', () => {
    it('should return pending comments', async () => {
      // Arrange
      const mockComments = [
        { id: 2, content: 'Comment 2', userId: 2, event_id: 1, isApproved: false }
      ];
      
      commentService.getPendingComments.mockResolvedValue(mockComments);
      
      // Act
      await commentController.getPendingComments(req, res, next);
      
      // Assert
      expect(commentService.getPendingComments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockComments
      });
    });
  });
  
  describe('getCommentsByEvent', () => {
    it('should return comments for an event', async () => {
      // Arrange
      const eventId = '1';
      req.params = { eventId };
      
      const mockComments = [
        { id: 1, content: 'Comment 1', userId: 1, event_id: 1, isApproved: true }
      ];
      
      commentService.getCommentsByEvent.mockResolvedValue(mockComments);
      
      // Act
      await commentController.getCommentsByEvent(req, res, next);
      
      // Assert
      expect(commentService.getCommentsByEvent).toHaveBeenCalledWith('1', true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockComments
      });
    });
    
    it('should return all comments for an event for moderator/admin', async () => {
      // Arrange
      const eventId = '1';
      req.params = { eventId };
      req.user = { id: 1, role: 'moderator' };
      
      const mockComments = [
        { id: 1, content: 'Comment 1', userId: 1, event_id: 1, isApproved: true },
        { id: 2, content: 'Comment 2', userId: 2, event_id: 1, isApproved: false }
      ];
      
      commentService.getCommentsByEvent.mockResolvedValue(mockComments);
      
      // Act
      await commentController.getCommentsByEvent(req, res, next);
      
      // Assert
      expect(commentService.getCommentsByEvent).toHaveBeenCalledWith('1', false);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockComments
      });
    });
    
    it('should pass validation error to next middleware if event ID is invalid', async () => {
      // Arrange
      req.params = { eventId: 'invalid' };
      
      // Act
      await commentController.getCommentsByEvent(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });
  });
  
  describe('approveComment', () => {
    it('should approve a comment successfully', async () => {
      // Arrange
      const commentId = '1';
      req.params = { id: commentId };
      
      const mockComment = {
        id: 1,
        content: 'Test comment',
        isApproved: true
      };
      
      commentService.approveComment.mockResolvedValue(mockComment);
      
      // Act
      await commentController.approveComment(req, res, next);
      
      // Assert
      expect(commentService.approveComment).toHaveBeenCalledWith(commentId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Comment approved successfully',
        data: mockComment
      });
    });
    
    it('should pass NotFoundError to next middleware if comment does not exist', async () => {
      // Arrange
      req.params = { id: '999' };
      const error = new NotFoundError('Comment not found');
      
      commentService.approveComment.mockRejectedValue(error);
      
      // Act
      await commentController.approveComment(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      // Arrange
      const commentId = '1';
      req.params = { id: commentId };
      
      commentService.rejectComment.mockResolvedValue(true);
      
      // Act
      await commentController.deleteComment(req, res, next);
      
      // Assert
      expect(commentService.rejectComment).toHaveBeenCalledWith(commentId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Comment deleted successfully'
      });
    });
    
    it('should pass NotFoundError to next middleware if comment does not exist', async () => {
      // Arrange
      req.params = { id: '999' };
      const error = new NotFoundError('Comment not found');
      
      commentService.rejectComment.mockRejectedValue(error);
      
      // Act
      await commentController.deleteComment(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
