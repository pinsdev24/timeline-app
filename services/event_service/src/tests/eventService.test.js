/**
 * Event Service Tests
 */
const { describe, it, expect, beforeEach, jest: jestObject } = require('@jest/globals');
const eventService = require('../services/eventService');
const Event = require('../models/event');
const fetch = require('node-fetch');
const { NotFoundError, ServiceError } = require('../utils/errorHandler');

// Mock dependencies
jest.mock('../models/event');
jest.mock('node-fetch');

describe('Event Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getAllEvents', () => {
    it('should return all events', async () => {
      // Arrange
      const mockEvents = [
        {
          id: 1,
          title: 'Event 1',
          period_id: 10,
          description: 'Test description'
        },
        {
          id: 2,
          title: 'Event 2',
          period_id: 10,
          description: 'Another test description'
        }
      ];
      
      Event.findAll.mockResolvedValue(mockEvents);
      
      // Act
      const result = await eventService.getAllEvents();
      
      // Assert
      expect(Event.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getEventById', () => {
    it('should return an event by its ID', async () => {
      // Arrange
      const eventId = 123;
      const mockEvent = {
        id: eventId,
        title: 'Test Event',
        period_id: 10,
        description: 'Test description'
      };
      
      Event.findByPk.mockResolvedValue(mockEvent);
      
      // Act
      const result = await eventService.getEventById(eventId);
      
      // Assert
      expect(Event.findByPk).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(mockEvent);
    });
    
    it('should throw NotFoundError if event does not exist', async () => {
      // Arrange
      const eventId = 999;
      Event.findByPk.mockResolvedValue(null);
      
      // Act & Assert
      await expect(eventService.getEventById(eventId))
        .rejects.toThrow(NotFoundError);
      expect(Event.findByPk).toHaveBeenCalledWith(eventId);
    });
  });
  
  describe('createEvent', () => {
    it('should create a new event successfully', async () => {
      // Arrange
      const eventData = {
        title: 'New Event',
        period_id: 10,
        description: 'Event description',
        date: new Date('2023-01-01')
      };
      
      const mockCreatedEvent = {
        id: 123,
        ...eventData
      };
      
      Event.create.mockResolvedValue(mockCreatedEvent);
      
      // Act
      const result = await eventService.createEvent(eventData);
      
      // Assert
      expect(Event.create).toHaveBeenCalledWith(eventData);
      expect(result).toEqual(mockCreatedEvent);
    });
  });
  
  describe('updateEvent', () => {
    it('should update an event successfully', async () => {
      // Arrange
      const eventId = 123;
      const eventData = {
        title: 'Updated Event Title'
      };
      
      const mockEvent = {
        id: eventId,
        title: 'Original Title',
        period_id: 10,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Event.findByPk.mockResolvedValue(mockEvent);
      
      // Act
      await eventService.updateEvent(eventId, eventData);
      
      // Assert
      expect(Event.findByPk).toHaveBeenCalledWith(eventId);
      expect(mockEvent.update).toHaveBeenCalledWith(eventData);
    });
    
    it('should throw NotFoundError if event does not exist', async () => {
      // Arrange
      const eventId = 999;
      const eventData = { title: 'Updated Title' };
      
      Event.findByPk.mockResolvedValue(null);
      
      // Act & Assert
      await expect(eventService.updateEvent(eventId, eventData))
        .rejects.toThrow(NotFoundError);
      expect(Event.findByPk).toHaveBeenCalledWith(eventId);
    });
  });
  
  describe('deleteEvent', () => {
    it('should delete an event successfully', async () => {
      // Arrange
      const eventId = 123;
      const mockEvent = {
        id: eventId,
        title: 'Event to Delete',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Event.findByPk.mockResolvedValue(mockEvent);
      
      // Act
      const result = await eventService.deleteEvent(eventId);
      
      // Assert
      expect(Event.findByPk).toHaveBeenCalledWith(eventId);
      expect(mockEvent.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    
    it('should throw NotFoundError if event does not exist', async () => {
      // Arrange
      const eventId = 999;
      Event.findByPk.mockResolvedValue(null);
      
      // Act & Assert
      await expect(eventService.deleteEvent(eventId))
        .rejects.toThrow(NotFoundError);
      expect(Event.findByPk).toHaveBeenCalledWith(eventId);
    });
  });
  
  describe('getMediasByEvent', () => {
    it('should fetch media for an event successfully', async () => {
      // Arrange
      const eventId = 123;
      const mockMedia = [
        { id: 1, url: 'media1.jpg', event_id: eventId },
        { id: 2, url: 'media2.jpg', event_id: eventId }
      ];
      
      // Mock fetch response
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockMedia)
      };
      fetch.mockResolvedValue(mockResponse);
      
      // Act
      const result = await eventService.getMediasByEvent(eventId);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/events/${eventId}`));
      expect(mockResponse.json).toHaveBeenCalled();
      expect(result).toEqual(mockMedia);
    });
    
    it('should throw ServiceError when media service returns an error', async () => {
      // Arrange
      const eventId = 123;
      
      // Mock fetch response with error
      const mockResponse = {
        ok: false,
        statusText: 'Service Unavailable'
      };
      fetch.mockResolvedValue(mockResponse);
      
      // Act & Assert
      await expect(eventService.getMediasByEvent(eventId))
        .rejects.toThrow(ServiceError);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/events/${eventId}`));
    });
    
    it('should throw ServiceError when fetch fails', async () => {
      // Arrange
      const eventId = 123;
      
      // Mock fetch to throw an error
      fetch.mockRejectedValue(new Error('Network error'));
      
      // Act & Assert
      await expect(eventService.getMediasByEvent(eventId))
        .rejects.toThrow(ServiceError);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/events/${eventId}`));
    });
  });
  
  describe('getEventsByPeriod', () => {
    it('should return events for a specific period ordered by date', async () => {
      // Arrange
      const periodId = 10;
      const mockEvents = [
        {
          id: 1,
          title: 'Event 1',
          period_id: periodId,
          date: new Date('2023-01-01')
        },
        {
          id: 2,
          title: 'Event 2',
          period_id: periodId,
          date: new Date('2022-01-01')
        }
      ];
      
      Event.findAll.mockResolvedValue(mockEvents);
      
      // Act
      const result = await eventService.getEventsByPeriod(periodId);
      
      // Assert
      expect(Event.findAll).toHaveBeenCalledWith({ 
        where: { period_id: periodId },
        order: [['date', 'ASC']]
      });
      expect(result).toEqual(mockEvents);
    });
  });
});
