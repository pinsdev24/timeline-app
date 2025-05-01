/**
 * Period Controller
 * Handles HTTP requests for period operations
 */
const periodService = require('../services/periodService');
const { validatePeriod } = require('../utils/validators');
const { ValidationError } = require('../utils/errorHandler');

// Helper function to validate and parse integer ID
const validateAndParseIntId = (idParam, paramName) => {
  const id = parseInt(idParam, 10);
  if (isNaN(id) || id <= 0) {
    throw new ValidationError(`Invalid ${paramName} format: Must be a positive integer`);
  }
  return id;
};

/**
 * Get all periods
 * @route GET /periods
 */
const getAllPeriods = async (req, res, next) => {
  try {
    const periods = await periodService.getAllPeriods();
    
    res.status(200).json({
      success: true,
      count: periods.length,
      data: periods
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get period by ID
 * @route GET /periods/:id
 */
const getPeriodById = async (req, res, next) => {
  try {
    const periodId = validateAndParseIntId(req.params.id, 'period ID');
    
    const period = await periodService.getPeriodById(periodId);
    
    res.status(200).json({
      success: true,
      data: period
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new period
 * @route POST /periods
 */
const createPeriod = async (req, res, next) => {
  try {
    const validationErrors = validatePeriod(req.body);
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.join(', '));
    }
    
    const newPeriod = await periodService.createPeriod(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Period created successfully',
      data: newPeriod
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a period
 * @route PUT /periods/:id
 */
const updatePeriod = async (req, res, next) => {
  try {
    const periodId = validateAndParseIntId(req.params.id, 'period ID');
    
    const validationErrors = validatePeriod(req.body);
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.join(', '));
    }
    
    const updatedPeriod = await periodService.updatePeriod(periodId, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Period updated successfully',
      data: updatedPeriod
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a period
 * @route DELETE /periods/:id
 */
const deletePeriod = async (req, res, next) => {
  try {
    const periodId = validateAndParseIntId(req.params.id, 'period ID');
    
    await periodService.deletePeriod(periodId);
    
    res.status(200).json({
      success: true,
      message: 'Period deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get periods with event counts
 * @route GET /periods/with-counts
 */
const getPeriodsWithEventCounts = async (req, res, next) => {
  try {
    const periods = await periodService.getPeriodsWithEventCounts();
    
    res.status(200).json({
      success: true,
      count: periods.length,
      data: periods
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPeriods,
  getPeriodById,
  createPeriod,
  updatePeriod,
  deletePeriod,
  getPeriodsWithEventCounts
};
