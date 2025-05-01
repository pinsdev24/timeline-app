/**
 * Comment Service Tests
 */
const { describe, it, expect, beforeEach, afterEach, jest: jestObject } = require('@jest/globals');
const commentService = require('../services/commentService');
const Comment = require('../models/Comment');
const { NotFoundError } = require('../utils/errorHandler');

// Mock the Comment model
jest.mock('../models/Comment');

describe('Comment Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    it('should create a new comment successfully', async () => {
      // Arrange
      const commentData = {
        content: 'This is a test comment',
        userId: 1,
        event_id: 2
      };
      
      const mockComment = {
        id: 1,
        ...commentData,
        isApproved: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      Comment.create.mockResolvedValue(mockComment);
      
      // Act
      const result = await commentService.createComment(commentData);
      
      // Assert
      expect(Comment.create).toHaveBeenCalledWith(commentData);
      expect(result).toEqual(mockComment);
    });
  });

  describe('getAllComments', () => {
    it('should return all comments', async () => {
      // Arrange
      const mockComments = [
        { id: 1, content: 'Comment 1', userId: 1, event_id: 1, isApproved: true },
        { id: 2, content: 'Comment 2', userId: 2, event_id: 1, isApproved: false }
      ];
      
      Comment.findAll.mockResolvedValue(mockComments);
      
      // Act
      const result = await commentService.getAllComments();
      
      // Assert
      expect(Comment.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockComments);
    });
  });
  
  describe('getApprovedComments', () => {
    it('should return only approved comments', async () => {
      // Arrange
      const mockComments = [
        { id: 1, content: 'Comment 1', userId: 1, event_id: 1, isApproved: true }
      ];
      
      Comment.findAll.mockResolvedValue(mockComments);
      
      // Act
      const result = await commentService.getApprovedComments();
      
      // Assert
      expect(Comment.findAll).toHaveBeenCalledWith({ where: { isApproved: true } });
      expect(result).toEqual(mockComments);
    });
  });
  
  describe('getPendingComments', () => {
    it('should return only pending comments', async () => {
      // Arrange
      const mockComments = [
        { id: 2, content: 'Comment 2', userId: 2, event_id: 1, isApproved: false }
      ];
      
      Comment.findAll.mockResolvedValue(mockComments);
      
      // Act
      const result = await commentService.getPendingComments();
      
      // Assert
      expect(Comment.findAll).toHaveBeenCalledWith({ where: { isApproved: false } });
      expect(result).toEqual(mockComments);
    });
  });
  
  describe('getCommentsByEvent', () => {
    it('should return comments for a specific event (approved only)', async () => {
      // Arrange
      const eventId = 1;
      const mockComments = [
        { id: 1, content: 'Comment 1', userId: 1, event_id: eventId, isApproved: true }
      ];
      
      Comment.findAll.mockResolvedValue(mockComments);
      
      // Act
      const result = await commentService.getCommentsByEvent(eventId, true);
      
      // Assert
      expect(Comment.findAll).toHaveBeenCalledWith({ 
        where: { event_id: eventId, isApproved: true } 
      });
      expect(result).toEqual(mockComments);
    });
    
    it('should return all comments for a specific event when approvedOnly is false', async () => {
      // Arrange
      const eventId = 1;
      const mockComments = [
        { id: 1, content: 'Comment 1', userId: 1, event_id: eventId, isApproved: true },
        { id: 2, content: 'Comment 2', userId: 2, event_id: eventId, isApproved: false }
      ];
      
      Comment.findAll.mockResolvedValue(mockComments);
      
      // Act
      const result = await commentService.getCommentsByEvent(eventId, false);
      
      // Assert
      expect(Comment.findAll).toHaveBeenCalledWith({ 
        where: { event_id: eventId } 
      });
      expect(result).toEqual(mockComments);
    });
  });
  
  describe('approveComment', () => {
    it('should approve a comment successfully', async () => {
      // Arrange
      const commentId = 1;
      const mockComment = {
        id: commentId,
        content: 'Test comment',
        userId: 1,
        event_id: 1,
        isApproved: false,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Comment.findByPk.mockResolvedValue(mockComment);
      mockComment.update.mockResolvedValue({ 
        ...mockComment, 
        isApproved: true 
      });
      
      // Act
      const result = await commentService.approveComment(commentId);
      
      // Assert
      expect(Comment.findByPk).toHaveBeenCalledWith(commentId);
      expect(mockComment.update).toHaveBeenCalledWith({ isApproved: true });
      expect(result).toEqual({ ...mockComment, isApproved: true });
    });
    
    it('should throw NotFoundError if comment does not exist', async () => {
      // Arrange
      const commentId = 999;
      Comment.findByPk.mockResolvedValue(null);
      
      // Act & Assert
      await expect(commentService.approveComment(commentId))
        .rejects.toThrow(NotFoundError);
      expect(Comment.findByPk).toHaveBeenCalledWith(commentId);
    });
  });
  
  describe('rejectComment', () => {
    it('should delete a comment successfully', async () => {
      // Arrange
      const commentId = 1;
      const mockComment = {
        id: commentId,
        content: 'Test comment',
        userId: 1,
        event_id: 1,
        isApproved: false,
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Comment.findByPk.mockResolvedValue(mockComment);
      
      // Act
      const result = await commentService.rejectComment(commentId);
      
      // Assert
      expect(Comment.findByPk).toHaveBeenCalledWith(commentId);
      expect(mockComment.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    
    it('should throw NotFoundError if comment does not exist', async () => {
      // Arrange
      const commentId = 999;
      Comment.findByPk.mockResolvedValue(null);
      
      // Act & Assert
      await expect(commentService.rejectComment(commentId))
        .rejects.toThrow(NotFoundError);
      expect(Comment.findByPk).toHaveBeenCalledWith(commentId);
    });
  });
  
  describe('getCommentById', () => {
    it('should return a comment by its ID', async () => {
      // Arrange
      const commentId = 1;
      const mockComment = {
        id: commentId,
        content: 'Test comment',
        userId: 1,
        event_id: 1,
        isApproved: true
      };
      
      Comment.findByPk.mockResolvedValue(mockComment);
      
      // Act
      const result = await commentService.getCommentById(commentId);
      
      // Assert
      expect(Comment.findByPk).toHaveBeenCalledWith(commentId);
      expect(result).toEqual(mockComment);
    });
    
    it('should throw NotFoundError if comment does not exist', async () => {
      // Arrange
      const commentId = 999;
      Comment.findByPk.mockResolvedValue(null);
      
      // Act & Assert
      await expect(commentService.getCommentById(commentId))
        .rejects.toThrow(NotFoundError);
      expect(Comment.findByPk).toHaveBeenCalledWith(commentId);
    });
  });
});
