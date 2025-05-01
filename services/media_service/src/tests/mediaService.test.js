/**
 * Media Service Tests
 */
const { describe, it, expect, beforeEach, jest: jestObject } = require('@jest/globals');
const mediaService = require('../services/mediaService');
const Media = require('../../models/Media');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const { NotFoundError, ServiceError } = require('../utils/errorHandler');

// Mock dependencies
jest.mock('../../models/Media');
jest.mock('node-fetch');
jest.mock('fs', () => ({
  promises: {
    unlink: jest.fn().mockResolvedValue(undefined),
    readdir: jest.fn().mockResolvedValue([]),
    rmdir: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('Media Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getAllMedia', () => {
    it('should return all media', async () => {
      // Arrange
      const mockMedia = [
        {
          id: '1',
          type: 'image',
          url: '/uploads/event1/image-123.jpg',
          event_id: 'event1'
        },
        {
          id: '2',
          type: 'video',
          url: '/uploads/event1/video-456.mp4',
          event_id: 'event1'
        }
      ];
      
      Media.findAll.mockResolvedValue(mockMedia);
      
      // Act
      const result = await mediaService.getAllMedia();
      
      // Assert
      expect(Media.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockMedia);
    });

    it('should apply filters when provided', async () => {
      // Arrange
      const mockMedia = [
        {
          id: '1',
          type: 'image',
          url: '/uploads/event1/image-123.jpg',
          event_id: 'event1'
        }
      ];
      
      const filters = { type: 'image', event_id: 'event1' };
      Media.findAll.mockResolvedValue(mockMedia);
      
      // Act
      const result = await mediaService.getAllMedia(filters);
      
      // Assert
      expect(Media.findAll).toHaveBeenCalledWith({
        where: filters
      });
      expect(result).toEqual(mockMedia);
    });
  });

  describe('getMediaById', () => {
    it('should return media by its ID', async () => {
      // Arrange
      const mediaId = '123';
      const mockMedia = {
        id: mediaId,
        type: 'image',
        url: '/uploads/event1/image-123.jpg',
        event_id: 'event1'
      };
      
      Media.findByPk.mockResolvedValue(mockMedia);
      
      // Act
      const result = await mediaService.getMediaById(mediaId);
      
      // Assert
      expect(Media.findByPk).toHaveBeenCalledWith(mediaId);
      expect(result).toEqual(mockMedia);
    });
    
    it('should throw NotFoundError if media does not exist', async () => {
      // Arrange
      const mediaId = '999';
      Media.findByPk.mockResolvedValue(null);
      
      // Act & Assert
      await expect(mediaService.getMediaById(mediaId))
        .rejects.toThrow(NotFoundError);
      expect(Media.findByPk).toHaveBeenCalledWith(mediaId);
    });
  });
  
  describe('createMedia', () => {
    it('should create new media successfully', async () => {
      // Arrange
      const mediaData = {
        type: 'image',
        url: '/uploads/event1/image-123.jpg',
        event_id: 'event1',
        text: 'Test image',
        uploader_id: 'user1'
      };
      
      const mockCreatedMedia = {
        id: '123',
        ...mediaData
      };
      
      // Mock event verification
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, data: { id: 'event1' } })
      };
      fetch.mockResolvedValue(mockResponse);
      
      Media.create.mockResolvedValue(mockCreatedMedia);
      
      // Act
      const result = await mediaService.createMedia(mediaData);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('event1'));
      expect(Media.create).toHaveBeenCalledWith(mediaData);
      expect(result).toEqual(mockCreatedMedia);
    });
    
    it('should throw NotFoundError if event does not exist', async () => {
      // Arrange
      const mediaData = {
        type: 'image',
        url: '/uploads/event1/image-123.jpg',
        event_id: 'nonexistent',
        text: 'Test image',
        uploader_id: 'user1'
      };
      
      // Mock event verification failure
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      fetch.mockResolvedValue(mockResponse);
      
      // Act & Assert
      await expect(mediaService.createMedia(mediaData))
        .rejects.toThrow(NotFoundError);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('nonexistent'));
      expect(Media.create).not.toHaveBeenCalled();
    });
  });
  
  describe('updateMedia', () => {
    it('should update media successfully', async () => {
      // Arrange
      const mediaId = '123';
      const updateData = {
        text: 'Updated caption'
      };
      
      const mockMedia = {
        id: mediaId,
        type: 'image',
        url: '/uploads/event1/image-123.jpg',
        event_id: 'event1',
        text: 'Original caption',
        update: jest.fn().mockResolvedValue(true)
      };
      
      Media.findByPk.mockResolvedValue(mockMedia);
      
      // Act
      await mediaService.updateMedia(mediaId, updateData);
      
      // Assert
      expect(Media.findByPk).toHaveBeenCalledWith(mediaId);
      expect(mockMedia.update).toHaveBeenCalledWith(updateData);
    });
    
    it('should throw NotFoundError if media does not exist', async () => {
      // Arrange
      const mediaId = '999';
      const updateData = { text: 'Updated caption' };
      
      Media.findByPk.mockResolvedValue(null);
      
      // Act & Assert
      await expect(mediaService.updateMedia(mediaId, updateData))
        .rejects.toThrow(NotFoundError);
      expect(Media.findByPk).toHaveBeenCalledWith(mediaId);
    });
  });
  
  describe('deleteMedia', () => {
    it('should delete media with file successfully', async () => {
      // Arrange
      const mediaId = '123';
      const mockMedia = {
        id: mediaId,
        type: 'image',
        url: 'uploads/event1/image-123.jpg',
        event_id: 'event1',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Media.findByPk.mockResolvedValue(mockMedia);
      
      // Act
      const result = await mediaService.deleteMedia(mediaId);
      
      // Assert
      expect(Media.findByPk).toHaveBeenCalledWith(mediaId);
      expect(fs.unlink).toHaveBeenCalled();
      expect(fs.readdir).toHaveBeenCalled();
      expect(fs.rmdir).toHaveBeenCalled();
      expect(mockMedia.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    
    it('should delete media with external URL without touching filesystem', async () => {
      // Arrange
      const mediaId = '123';
      const mockMedia = {
        id: mediaId,
        type: 'image',
        url: 'https://example.com/image.jpg',
        event_id: 'event1',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Media.findByPk.mockResolvedValue(mockMedia);
      
      // Act
      const result = await mediaService.deleteMedia(mediaId);
      
      // Assert
      expect(Media.findByPk).toHaveBeenCalledWith(mediaId);
      expect(fs.unlink).not.toHaveBeenCalled();
      expect(mockMedia.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    
    it('should throw NotFoundError if media does not exist', async () => {
      // Arrange
      const mediaId = '999';
      Media.findByPk.mockResolvedValue(null);
      
      // Act & Assert
      await expect(mediaService.deleteMedia(mediaId))
        .rejects.toThrow(NotFoundError);
      expect(Media.findByPk).toHaveBeenCalledWith(mediaId);
      expect(fs.unlink).not.toHaveBeenCalled();
    });
  });
  
  describe('getMediaByEventId', () => {
    it('should return all media for an event', async () => {
      // Arrange
      const eventId = 'event1';
      const mockMedia = [
        {
          id: '1',
          type: 'image',
          url: '/uploads/event1/image-123.jpg',
          event_id: eventId
        },
        {
          id: '2',
          type: 'video',
          url: '/uploads/event1/video-456.mp4',
          event_id: eventId
        }
      ];
      
      // Mock event verification
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, data: { id: eventId } })
      };
      fetch.mockResolvedValue(mockResponse);
      
      Media.findAll.mockResolvedValue(mockMedia);
      
      // Act
      const result = await mediaService.getMediaByEventId(eventId);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(eventId));
      expect(Media.findAll).toHaveBeenCalledWith({
        where: { event_id: eventId },
        order: [['created_at', 'DESC']]
      });
      expect(result).toEqual(mockMedia);
    });
    
    it('should throw NotFoundError if event does not exist', async () => {
      // Arrange
      const eventId = 'nonexistent';
      
      // Mock event verification failure
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      fetch.mockResolvedValue(mockResponse);
      
      // Act & Assert
      await expect(mediaService.getMediaByEventId(eventId))
        .rejects.toThrow(NotFoundError);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(eventId));
      expect(Media.findAll).not.toHaveBeenCalled();
    });
  });
});
