/**
 * Media Controller Tests
 */
const { describe, it, expect, beforeEach, jest: jestObject } = require('@jest/globals');
const mediaController = require('../controllers/mediaController');
const mediaService = require('../services/mediaService');
const { ValidationError, NotFoundError } = require('../utils/errorHandler');

// Mock dependencies
jest.mock('../services/mediaService');

describe('Media Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next function
    req = {
      body: {},
      params: {},
      query: {},
      user: {
        id: 'user1',
        role: 'curator'
      },
      file: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('getAllMedia', () => {
    it('should return all media successfully', async () => {
      // Arrange
      const mockMedia = [
        { id: 1, type: 'image', url: '/uploads/image1.jpg' },
        { id: 2, type: 'video', url: '/uploads/video1.mp4' }
      ];
      
      mediaService.getAllMedia.mockResolvedValue(mockMedia);
      
      // Act
      await mediaController.getAllMedia(req, res, next);
      
      // Assert
      expect(mediaService.getAllMedia).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockMedia
      });
    });
    
    it('should apply filters from query parameters', async () => {
      // Arrange
      req.query = { 
        type: 'image',
        event_id: '123e4567-e89b-12d3-a456-426614174000' // Valid UUID
      };
      
      const mockMedia = [
        { id: 1, type: 'image', url: '/uploads/image1.jpg', event_id: '123e4567-e89b-12d3-a456-426614174000' }
      ];
      
      mediaService.getAllMedia.mockResolvedValue(mockMedia);
      
      // Act
      await mediaController.getAllMedia(req, res, next);
      
      // Assert
      expect(mediaService.getAllMedia).toHaveBeenCalledWith({
        type: 'image',
        event_id: '123e4567-e89b-12d3-a456-426614174000'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockMedia
      });
    });
    
    it('should handle invalid UUID in query parameters', async () => {
      // Arrange
      req.query = { 
        event_id: 'invalid-uuid' 
      };
      
      // Act
      await mediaController.getAllMedia(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(mediaService.getAllMedia).not.toHaveBeenCalled();
    });
    
    it('should handle errors properly', async () => {
      // Arrange
      const error = new Error('Test error');
      mediaService.getAllMedia.mockRejectedValue(error);
      
      // Act
      await mediaController.getAllMedia(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMediaById', () => {
    it('should return media by ID successfully', async () => {
      // Arrange
      const mediaId = 1; // Valid UUID
      req.params = { id: mediaId };
      
      const mockMedia = { 
        id: mediaId, 
        type: 'image', 
        url: '/uploads/image1.jpg'
      };
      
      mediaService.getMediaById.mockResolvedValue(mockMedia);
      
      // Act
      await mediaController.getMediaById(req, res, next);
      
      // Assert
      expect(mediaService.getMediaById).toHaveBeenCalledWith(mediaId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMedia
      });
    });
    
    it('should handle invalid ID format', async () => {
      // Arrange
      req.params = { id: 'invalid-id' };
      
      // Act
      await mediaController.getMediaById(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(mediaService.getMediaById).not.toHaveBeenCalled();
    });
    
    it('should handle not found error', async () => {
      // Arrange
      const mediaId = 1;
      req.params = { id: mediaId };
      
      const error = new NotFoundError('Media not found');
      mediaService.getMediaById.mockRejectedValue(error);
      
      // Act
      await mediaController.getMediaById(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('createMedia', () => {
    it('should create media with file upload successfully', async () => {
      // Arrange
      const eventId = 1;
      req.body = { 
        event_id: eventId,
        text: 'Test image description'
      };
      
      req.file = {
        path: '/path/to/uploads/event1/image1.jpg',
        originalname: 'original-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024
      };
      
      const expectedMediaData = {
        event_id: eventId,
        text: 'Test image description',
        uploader_id: 'user1',
        type: 'image',
        url: expect.any(String),
      };
      
      const mockCreatedMedia = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        ...expectedMediaData
      };
      
      mediaService.createMedia.mockResolvedValue(mockCreatedMedia);
      
      // Act
      await mediaController.createMedia(req, res, next);
      
      // Assert
      expect(mediaService.createMedia).toHaveBeenCalledWith(expect.objectContaining(expectedMediaData));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Media created successfully',
        data: mockCreatedMedia
      });
    });
    
    it('should create media with external URL successfully', async () => {
      // Arrange
      const eventId = 1;
      req.body = { 
        event_id: eventId,
        type: 'image',
        url: 'https://example.com/image.jpg',
        text: 'External image'
      };
      
      const expectedMediaData = {
        event_id: eventId,
        type: 'image',
        url: 'https://example.com/image.jpg',
        text: 'External image',
        uploader_id: 'user1'
      };
      
      const mockCreatedMedia = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        ...expectedMediaData
      };
      
      mediaService.createMedia.mockResolvedValue(mockCreatedMedia);
      
      // Act
      await mediaController.createMedia(req, res, next);
      
      // Assert
      expect(mediaService.createMedia).toHaveBeenCalledWith(expect.objectContaining(expectedMediaData));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Media created successfully',
        data: mockCreatedMedia
      });
    });
    
    it('should handle missing event_id', async () => {
      // Arrange
      req.body = { 
        text: 'Missing event_id'
      };
      
      // Act
      await mediaController.createMedia(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(mediaService.createMedia).not.toHaveBeenCalled();
    });
    
    it('should handle invalid event_id format', async () => {
      // Arrange
      req.body = { 
        event_id: 'invalid id',
        text: 'Invalid event_id'
      };
      
      // Act
      await mediaController.createMedia(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(mediaService.createMedia).not.toHaveBeenCalled();
    });
  });
  
  describe('updateMedia', () => {
    it('should update media successfully', async () => {
      // Arrange
      const mediaId = 1;
      req.params = { id: mediaId };
      req.body = {
        text: 'Updated description',
        is_public: false
      };
      
      const mockUpdatedMedia = {
        id: mediaId,
        type: 'image',
        url: '/uploads/image1.jpg',
        text: 'Updated description',
        is_public: false
      };
      
      mediaService.updateMedia.mockResolvedValue(mockUpdatedMedia);
      
      // Act
      await mediaController.updateMedia(req, res, next);
      
      // Assert
      expect(mediaService.updateMedia).toHaveBeenCalledWith(mediaId, {
        text: 'Updated description',
        is_public: false
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Media updated successfully',
        data: mockUpdatedMedia
      });
    });
    
    it('should prevent updating protected fields', async () => {
      // Arrange
      const mediaId = 1;
      req.params = { id: mediaId };
      req.body = {
        id: 'hacker-attempt-to-change-id',
        url: 'hacker-attempt-to-change-url',
        type: 'video', // attempt to change type
        uploader_id: 'hacker-attempt-to-change-uploader',
        text: 'Legitimate text update',
        is_public: false
      };
      
      const mockUpdatedMedia = {
        id: mediaId, // original unchanged
        type: 'image', // original unchanged
        url: '/uploads/image1.jpg', // original unchanged
        uploader_id: 'user1', // original unchanged
        text: 'Legitimate text update', // updated
        is_public: false // updated
      };
      
      mediaService.updateMedia.mockResolvedValue(mockUpdatedMedia);
      
      // Act
      await mediaController.updateMedia(req, res, next);
      
      // Assert
      // Only the allowed fields should be passed to updateMedia
      expect(mediaService.updateMedia).toHaveBeenCalledWith(mediaId, {
        text: 'Legitimate text update',
        is_public: false
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
    
    it('should handle invalid UUID format', async () => {
      // Arrange
      req.params = { id: 'invalid-id' };
      req.body = { text: 'Updated description' };
      
      // Act
      await mediaController.updateMedia(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(mediaService.updateMedia).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteMedia', () => {
    it('should delete media successfully', async () => {
      // Arrange
      const mediaId = 1;
      req.params = { id: mediaId };
      
      mediaService.deleteMedia.mockResolvedValue(true);
      
      // Act
      await mediaController.deleteMedia(req, res, next);
      
      // Assert
      expect(mediaService.deleteMedia).toHaveBeenCalledWith(mediaId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Media deleted successfully',
        data: {}
      });
    });
    
    it('should handle invalid UUID format', async () => {
      // Arrange
      req.params = { id: 'invalid-id' };
      
      // Act
      await mediaController.deleteMedia(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(mediaService.deleteMedia).not.toHaveBeenCalled();
    });
  });
  
  describe('getMediaByEventId', () => {
    it('should return media for an event successfully', async () => {
      // Arrange
      const eventId = 1;
      req.params = { eventId };
      
      const mockMedia = [
        { id: 1, type: 'image', url: '/uploads/image1.jpg', event_id: eventId },
        { id: 2, type: 'video', url: '/uploads/video1.mp4', event_id: eventId }
      ];
      
      mediaService.getMediaByEventId.mockResolvedValue(mockMedia);
      
      // Act
      await mediaController.getMediaByEventId(req, res, next);
      
      // Assert
      expect(mediaService.getMediaByEventId).toHaveBeenCalledWith(eventId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockMedia
      });
    });
    
    it('should handle invalid ID format', async () => {
      // Arrange
      req.params = { eventId: 'invalid-id' };
      
      // Act
      await mediaController.getMediaByEventId(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(mediaService.getMediaByEventId).not.toHaveBeenCalled();
    });
  });
});
