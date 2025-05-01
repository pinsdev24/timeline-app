/**
 * Period Service Tests
 */
const { describe, it, expect, beforeEach, afterEach, jest: jestObject } = require('@jest/globals');
const { NotFoundError } = require('../utils/errorHandler');

// Import actual models (remove jest.mock calls)
const Period = require('../models/period');
const Event = require('../models/event');
const periodService = require('../services/periodService');

describe('Period Service', () => {
  // Use afterEach to restore all mocks
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllPeriods', () => {
    it('should return all periods ordered by start date', async () => {
      // Arrange
      const mockPeriods = [
        {
          id: 10,
          name: 'Medieval Period',
          start_date: new Date('1000-01-01'),
          end_date: new Date('1500-12-31')
        },
        {
          id: 11,
          name: 'Renaissance',
          start_date: new Date('1400-01-01'),
          end_date: new Date('1600-12-31')
        }
      ];
      // Mock the specific method used
      const findAllMock = jest.spyOn(Period, 'findAll').mockResolvedValue(mockPeriods);
      
      // Act
      const result = await periodService.getAllPeriods();
      
      // Assert
      expect(findAllMock).toHaveBeenCalledWith({
        order: [['start_date', 'ASC']]
      });
      expect(result).toEqual(mockPeriods);
    });
  });

  describe('getPeriodById', () => {
    it('should return a period by its ID', async () => {
      // Arrange
      const periodId = 123;
      const mockPeriod = {
        id: periodId,
        name: 'Medieval Period',
        start_date: new Date('1000-01-01'),
        end_date: new Date('1500-12-31')
      };
      // Mock the specific method used
      const findByPkMock = jest.spyOn(Period, 'findByPk').mockResolvedValue(mockPeriod);
      
      // Act
      const result = await periodService.getPeriodById(periodId);
      
      // Assert
      expect(findByPkMock).toHaveBeenCalledWith(periodId);
      expect(result).toEqual(mockPeriod);
    });
    
    it('should throw NotFoundError if period does not exist', async () => {
      // Arrange
      const periodId = 999;
      // Mock the specific method used
      const findByPkMock = jest.spyOn(Period, 'findByPk').mockResolvedValue(null);
      
      // Act & Assert
      await expect(periodService.getPeriodById(periodId))
        .rejects.toThrow(NotFoundError);
      expect(findByPkMock).toHaveBeenCalledWith(periodId);
    });
  });
  
  describe('createPeriod', () => {
    it('should create a new period successfully', async () => {
      // Arrange
      const periodData = {
        name: 'Modern Era',
        start_date: new Date('1800-01-01'),
        end_date: new Date('2000-12-31')
      };
      const mockCreatedPeriod = {
        id: 123,
        ...periodData
      };
      // Mock the specific method used
      const createMock = jest.spyOn(Period, 'create').mockResolvedValue(mockCreatedPeriod);
      
      // Act
      const result = await periodService.createPeriod(periodData);
      
      // Assert
      expect(createMock).toHaveBeenCalledWith(periodData);
      expect(result).toEqual(mockCreatedPeriod);
    });
  });
  
  describe('updatePeriod', () => {
    it('should update a period successfully', async () => {
      // Arrange
      const periodId = 123;
      const periodData = {
        name: 'Updated Period Name'
      };
      const mockPeriodInstance = {
        id: periodId,
        name: 'Original Name',
        start_date: new Date('1000-01-01'),
        end_date: new Date('1500-12-31'),
        update: jest.fn().mockResolvedValue(true) // Mock instance method
      };
      // Mock findByPk first
      const findByPkMock = jest.spyOn(Period, 'findByPk').mockResolvedValue(mockPeriodInstance);
      
      // Act
      await periodService.updatePeriod(periodId, periodData);
      
      // Assert
      expect(findByPkMock).toHaveBeenCalledWith(periodId);
      expect(mockPeriodInstance.update).toHaveBeenCalledWith(periodData);
    });
    
    it('should throw NotFoundError if period does not exist', async () => {
      // Arrange
      const periodId = 999;
      const periodData = { name: 'Updated Period Name' };
      // Mock findByPk to return null
      const findByPkMock = jest.spyOn(Period, 'findByPk').mockResolvedValue(null);
      
      // Act & Assert
      await expect(periodService.updatePeriod(periodId, periodData))
        .rejects.toThrow(NotFoundError);
      expect(findByPkMock).toHaveBeenCalledWith(periodId);
    });
  });
  
  describe('deletePeriod', () => {
    it('should delete a period successfully', async () => {
      // Arrange
      const periodId = 123;
      const mockPeriodInstance = {
        id: periodId,
        name: 'Period to Delete',
        destroy: jest.fn().mockResolvedValue(true) // Mock instance method
      };
      // Mock findByPk first
      const findByPkMock = jest.spyOn(Period, 'findByPk').mockResolvedValue(mockPeriodInstance);
      
      // Act
      const result = await periodService.deletePeriod(periodId);
      
      // Assert
      expect(findByPkMock).toHaveBeenCalledWith(periodId);
      expect(mockPeriodInstance.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    
    it('should throw NotFoundError if period does not exist', async () => {
      // Arrange
      const periodId = 999;
      // Mock findByPk to return null
      const findByPkMock = jest.spyOn(Period, 'findByPk').mockResolvedValue(null);
      
      // Act & Assert
      await expect(periodService.deletePeriod(periodId))
        .rejects.toThrow(NotFoundError);
      expect(findByPkMock).toHaveBeenCalledWith(periodId);
    });
  });
  
  describe('getPeriodsWithEventCounts', () => {
    it('should return periods with event counts', async () => {
      // Arrange
      const mockPeriods = [
        {
          id: 10,
          name: 'Period 1',
          // Mock toJSON if the service uses it implicitly
          toJSON: () => ({ id: 10, name: 'Period 1' })
        },
        {
          id: 11,
          name: 'Period 2',
          toJSON: () => ({ id: 11, name: 'Period 2' })
        }
      ];
      
      // Mock Period.findAll
      const findAllMock = jest.spyOn(Period, 'findAll').mockResolvedValue(mockPeriods);
      // Mock Event.count for each period
      const countMock = jest.spyOn(Event, 'count')
        .mockResolvedValueOnce(5) // Count for period 10
        .mockResolvedValueOnce(3); // Count for period 11
      
      // Act
      const result = await periodService.getPeriodsWithEventCounts();
      
      // Assert
      expect(findAllMock).toHaveBeenCalled();
      expect(countMock).toHaveBeenCalledTimes(2);
      // Check if Event.count was called with the correct period IDs
      expect(countMock).toHaveBeenNthCalledWith(1, { where: { period_id: 10 } });
      expect(countMock).toHaveBeenNthCalledWith(2, { where: { period_id: 11 } });
      
      expect(result).toEqual([
        { id: 10, name: 'Period 1', event_count: 5 },
        { id: 11, name: 'Period 2', event_count: 3 }
      ]);
    });
  });
});
