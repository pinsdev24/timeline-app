/**
 * Period Controller Tests
 */
const { describe, it, expect, beforeEach, jest: jestObject } = require('@jest/globals');
const periodController = require('../controllers/periodController');
const periodService = require('../services/periodService');
const { ValidationError, NotFoundError } = require('../utils/errorHandler');

// Mock dependencies
jest.mock('../services/periodService');

describe('Period Controller', () => {
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

  describe('getAllPeriods', () => {
    it('should return all periods successfully', async () => {
      // Arrange
      const mockPeriods = [
        { id: 10, name: 'Ancient Period' },
        { id: 11, name: 'Medieval Period' }
      ];
      
      periodService.getAllPeriods.mockResolvedValue(mockPeriods);
      
      // Act
      await periodController.getAllPeriods(req, res, next);
      
      // Assert
      expect(periodService.getAllPeriods).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockPeriods
      });
    });
    
    it('should handle errors properly', async () => {
      // Arrange
      const error = new Error('Test error');
      periodService.getAllPeriods.mockRejectedValue(error);
      
      // Act
      await periodController.getAllPeriods(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPeriodById', () => {
    it('should return a period by ID successfully', async () => {
      // Arrange
      const periodId = 10; 
      req.params = { id: String(periodId) }; // Params are strings
      
      const mockPeriod = { id: periodId, name: 'Medieval Period' };
      periodService.getPeriodById.mockResolvedValue(mockPeriod);
      
      // Act
      await periodController.getPeriodById(req, res, next);
      
      // Assert
      expect(periodService.getPeriodById).toHaveBeenCalledWith(periodId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPeriod
      });
    });
    
    it('should handle invalid ID format (non-integer)', async () => {
      // Arrange
      req.params = { id: 'invalid-id' };
      
      // Act
      await periodController.getPeriodById(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(next.mock.calls[0][0].message).toContain('Invalid period ID format');
    });

    it('should handle invalid ID format (non-positive)', async () => {
      // Arrange
      req.params = { id: '0' }; // Zero is invalid
      
      // Act
      await periodController.getPeriodById(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(next.mock.calls[0][0].message).toContain('Invalid period ID format');
    });
    
    it('should handle not found error', async () => {
      // Arrange
      const periodId = 999; 
      req.params = { id: String(periodId) };
      
      const error = new NotFoundError('Period not found');
      periodService.getPeriodById.mockRejectedValue(error);
      
      // Act
      await periodController.getPeriodById(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('createPeriod', () => {
    it('should create a period successfully', async () => {
      // Arrange
      const periodData = {
        name: 'Renaissance',
        start_date: '1400-01-01',
        end_date: '1600-12-31'
      };
      
      req.body = periodData;
      
      const mockCreatedPeriod = {
        id: 12, // Assume next ID
        ...periodData
      };
      
      periodService.createPeriod.mockResolvedValue(mockCreatedPeriod);
      
      // Act
      await periodController.createPeriod(req, res, next);
      
      // Assert
      expect(periodService.createPeriod).toHaveBeenCalledWith(periodData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Period created successfully',
        data: mockCreatedPeriod
      });
    });
    
    it('should handle validation errors', async () => {
      // Arrange
      req.body = { name: '' }; 
      
      // Act
      await periodController.createPeriod(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });
  });
  
  describe('updatePeriod', () => {
    it('should update a period successfully', async () => {
      // Arrange
      const periodId = 10; 
      const updateData = {
        name: 'Updated Period Name'
      };
      
      req.params = { id: String(periodId) };
      req.body = updateData;
      
      const mockUpdatedPeriod = {
        id: periodId,
        name: 'Updated Period Name',
        start_date: '1400-01-01',
        end_date: '1600-12-31'
      };
      
      periodService.updatePeriod.mockResolvedValue(mockUpdatedPeriod);
      
      // Act
      await periodController.updatePeriod(req, res, next);
      
      // Assert
      expect(periodService.updatePeriod).toHaveBeenCalledWith(periodId, updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Period updated successfully',
        data: mockUpdatedPeriod
      });
    });
    
    it('should handle invalid ID format during update', async () => {
      // Arrange
      req.params = { id: 'invalid-id' };
      req.body = { name: 'Valid Name' }; // Valid body

      // Act
      await periodController.updatePeriod(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(next.mock.calls[0][0].message).toContain('Invalid period ID format');
    });
    
    it('should handle validation errors during update', async () => {
      // Arrange
      const periodId = 10; // Valid ID
      req.params = { id: String(periodId) };
      req.body = { name: '' }; // Invalid body
      
      // Act
      await periodController.updatePeriod(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });
  });
  
  describe('deletePeriod', () => {
    it('should delete a period successfully', async () => {
      // Arrange
      const periodId = 10; 
      req.params = { id: String(periodId) };
      
      periodService.deletePeriod.mockResolvedValue(); // Indicate success
      
      // Act
      await periodController.deletePeriod(req, res, next);
      
      // Assert
      expect(periodService.deletePeriod).toHaveBeenCalledWith(periodId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Period deleted successfully',
        data: {}
      });
    });
    
    it('should handle invalid ID format during delete', async () => {
      // Arrange
      req.params = { id: '-10' }; // Invalid ID

      // Act
      await periodController.deletePeriod(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(next.mock.calls[0][0].message).toContain('Invalid period ID format');
    });
    
    it('should handle not found error during delete', async () => {
      // Arrange
      const periodId = 999; // Use integer ID
      req.params = { id: String(periodId) };
      
      const error = new NotFoundError('Period not found for deletion');
      periodService.deletePeriod.mockRejectedValue(error);
      
      // Act
      await periodController.deletePeriod(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('getPeriodsWithEventCounts', () => {
    it('should return periods with counts successfully', async () => {
      // Arrange
      const mockPeriodsWithCounts = [
        { id: 10, name: 'Ancient', event_count: 5 },
        { id: 11, name: 'Medieval', event_count: 12 }
      ];
      
      periodService.getPeriodsWithEventCounts.mockResolvedValue(mockPeriodsWithCounts);
      
      // Act
      await periodController.getPeriodsWithEventCounts(req, res, next);
      
      // Assert
      expect(periodService.getPeriodsWithEventCounts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockPeriodsWithCounts
      });
    });
  });
});
