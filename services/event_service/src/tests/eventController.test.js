/**
 * Event Controller Tests
 */
const { describe, it, expect, beforeEach, jest: jestObject } = require('@jest/globals');
const eventController = require('../controllers/eventController');
const eventService = require('../services/eventService');
const { ValidationError, NotFoundError, ServiceError } = require('../utils/errorHandler');

// Mock dependencies
jest.mock('../services/eventService');

describe('Event Controller', () => {
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
        role: 'curator'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('getAllEvents', () => {
    it('should return all events successfully', async () => {
      // Arrange
      const mockEvents = [
        { id: 1, title: 'French Revolution', period_id: 10 },
        { id: 2, title: 'Renaissance Art', period_id: 11 }
      ];
      
      eventService.getAllEvents.mockResolvedValue(mockEvents);
      
      // Act
      await eventController.getAllEvents(req, res, next);
      
      // Assert
      expect(eventService.getAllEvents).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockEvents
      });
    });
    
    it('should handle errors properly', async () => {
      // Arrange
      const error = new Error('Test error');
      eventService.getAllEvents.mockRejectedValue(error);
      
      // Act
      await eventController.getAllEvents(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getEventById', () => {
    it('should return an event by ID successfully', async () => {
      // Arrange
      const eventId = 1; 
      req.params = { id: String(eventId) }; 
      
      const mockEvent = { 
        id: eventId, 
        title: 'Mona Lisa Creation', 
        period_id: 10, 
        description: 'Leonardo da Vinci painted the Mona Lisa'
      };
      
      eventService.getEventById.mockResolvedValue(mockEvent);
      
      // Act
      await eventController.getEventById(req, res, next);
      
      // Assert
      expect(eventService.getEventById).toHaveBeenCalledWith(eventId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockEvent
      });
    });
    
    it('should handle invalid ID format (non-integer)', async () => {
      // Arrange
      req.params = { id: 'invalid-id' };
      
      // Act
      await eventController.getEventById(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(next.mock.calls[0][0].message).toContain('Invalid event ID format');
    });

    it('should handle invalid ID format (non-positive)', async () => {
      // Arrange
      req.params = { id: '0' }; 
      
      // Act
      await eventController.getEventById(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(next.mock.calls[0][0].message).toContain('Invalid event ID format');
    });
    
    it('should handle not found error', async () => {
      // Arrange
      const eventId = 999; 
      req.params = { id: String(eventId) };
      
      const error = new NotFoundError('Event not found');
      eventService.getEventById.mockRejectedValue(error);
      
      // Act
      await eventController.getEventById(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('createEvent', () => {
    it('should create an event successfully', async () => {
      // Arrange
      const eventData = {
        title: 'Egyptian Pyramids Construction',
        period_id: 10, 
        description: 'Construction of the Great Pyramid of Giza',
        date: '2500-01-01' 
      };
      
      req.body = eventData;
      
      const mockCreatedEvent = {
        id: 3, 
        ...eventData
      };
      
      eventService.createEvent.mockResolvedValue(mockCreatedEvent);
      
      // Act
      await eventController.createEvent(req, res, next);
      
      // Assert
      expect(eventService.createEvent).toHaveBeenCalledWith(eventData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Event created successfully',
        data: mockCreatedEvent
      });
    });
    
    it('should handle validation errors', async () => {
      // Arrange
      req.body = { 
        description: 'Missing title and period_id'
      }; 
      
      // Act
      await eventController.createEvent(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });
  });
  
  describe('updateEvent', () => {
    it('should update an event successfully', async () => {
      // Arrange
      const eventId = 1; 
      const updateData = {
        title: 'Updated Event Title',
        period_id: 11 
      };
      
      req.params = { id: String(eventId) };
      req.body = updateData;
      
      const mockUpdatedEvent = {
        id: eventId,
        ...updateData,
        description: 'Original description'
      };
      
      eventService.updateEvent.mockResolvedValue(mockUpdatedEvent);
      
      // Act
      await eventController.updateEvent(req, res, next);
      
      // Assert
      expect(eventService.updateEvent).toHaveBeenCalledWith(eventId, updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Event updated successfully',
        data: mockUpdatedEvent
      });
    });

    it('should handle invalid ID format during update', async () => {
      // Arrange
      req.params = { id: 'invalid-update-id' };
      req.body = { title: 'Valid Title', period_id: 10 }; 

      // Act
      await eventController.updateEvent(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(next.mock.calls[0][0].message).toContain('Invalid event ID format');
    });
    
    it('should handle validation errors during update', async () => {
      // Arrange
      const eventId = 1; 
      req.params = { id: String(eventId) };
      req.body = { description: 'Missing title' }; 
      
      // Act
      await eventController.updateEvent(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });
  });
  
  describe('deleteEvent', () => {
    it('should delete an event successfully', async () => {
      // Arrange
      const eventId = 1; 
      req.params = { id: String(eventId) };
      
      eventService.deleteEvent.mockResolvedValue(); 
      
      // Act
      await eventController.deleteEvent(req, res, next);
      
      // Assert
      expect(eventService.deleteEvent).toHaveBeenCalledWith(eventId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Event deleted successfully',
        data: {}
      });
    });

    it('should handle invalid ID format during delete', async () => {
      // Arrange
      req.params = { id: '-5' }; 

      // Act
      await eventController.deleteEvent(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(next.mock.calls[0][0].message).toContain('Invalid event ID format');
    });
    
    it('should handle not found error during delete', async () => {
      // Arrange
      const eventId = 999; 
      req.params = { id: String(eventId) };
      
      const error = new NotFoundError('Event not found for deletion');
      eventService.deleteEvent.mockRejectedValue(error);
      
      // Act
      await eventController.deleteEvent(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('getMediasByEvent', () => {
    it('should return media for an event successfully', async () => {
      // Arrange
      const eventId = 1; 
      req.params = { eventId: String(eventId) };
      
      const mockMedia = [
        { id: 100, url: 'image1.jpg' },
        { id: 101, url: 'image2.png' }
      ];
      
      eventService.getMediasByEvent.mockResolvedValue(mockMedia);
      
      // Act
      await eventController.getMediasByEvent(req, res, next);
      
      // Assert
      expect(eventService.getMediasByEvent).toHaveBeenCalledWith(eventId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockMedia
      });
    });

    it('should handle invalid event ID format for media', async () => {
      // Arrange
      req.params = { eventId: 'abc' };

      // Act
      await eventController.getMediasByEvent(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(next.mock.calls[0][0].message).toContain('Invalid event ID format');
    });
  });
  
  describe('getMediasByPeriod', () => {
    it('should return media for a period successfully', async () => {
      // Arrange
      const periodId = 10; 
      req.params = { periodId: String(periodId) };
      
      const mockMedia = [
        { id: 100, url: 'image1.jpg' },
        { id: 200, url: 'image3.gif' }
      ];
      
      eventService.getMediasByPeriod.mockResolvedValue(mockMedia);
      
      // Act
      await eventController.getMediasByPeriod(req, res, next);
      
      // Assert
      expect(eventService.getMediasByPeriod).toHaveBeenCalledWith(periodId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockMedia
      });
    });

    it('should handle invalid period ID format for media', async () => {
      // Arrange
      req.params = { periodId: 'xyz' };

      // Act
      await eventController.getMediasByPeriod(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(next.mock.calls[0][0].message).toContain('Invalid period ID format');
    });
  });
  
  describe('getEventsByPeriod', () => {
    it('should return events for a period successfully', async () => {
      // Arrange
      const periodId = 10; 
      req.params = { periodId: String(periodId) };
      
      const mockEvents = [
        { id: 1, title: 'Event A', period_id: periodId },
        { id: 5, title: 'Event B', period_id: periodId }
      ];
      
      eventService.getEventsByPeriod.mockResolvedValue(mockEvents);
      
      // Act
      await eventController.getEventsByPeriod(req, res, next);
      
      // Assert
      expect(eventService.getEventsByPeriod).toHaveBeenCalledWith(periodId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockEvents
      });
    });

    it('should handle invalid period ID format for events', async () => {
      // Arrange
      req.params = { periodId: '0' }; 

      // Act
      await eventController.getEventsByPeriod(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(next.mock.calls[0][0].message).toContain('Invalid period ID format');
    });
  });
});
