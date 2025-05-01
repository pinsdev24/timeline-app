/**
 * Period Service
 * Handles business logic for period operations
 */
const Period = require('../models/period');
const Event = require('../models/event');
const { NotFoundError } = require('../utils/errorHandler');

/**
 * Get all periods
 * @returns {Array} - All periods
 */
const getAllPeriods = async () => {
  return await Period.findAll({
    order: [['start_date', 'ASC']]
  });
};

/**
 * Get period by ID
 * @param {String} id - Period ID
 * @returns {Object} - Period object
 */
const getPeriodById = async (id) => {
  const period = await Period.findByPk(id);
  
  if (!period) {
    throw new NotFoundError('Period not found');
  }
  
  return period;
};

/**
 * Create a new period
 * @param {Object} periodData - Period data
 * @returns {Object} - Created period
 */
const createPeriod = async (periodData) => {
  return await Period.create(periodData);
};

/**
 * Update a period
 * @param {String} id - Period ID
 * @param {Object} periodData - New period data
 * @returns {Object} - Updated period
 */
const updatePeriod = async (id, periodData) => {
  const period = await getPeriodById(id);
  
  await period.update(periodData);
  return period;
};

/**
 * Delete a period
 * @param {String} id - Period ID
 * @returns {Boolean} - Success status
 */
const deletePeriod = async (id) => {
  const period = await getPeriodById(id);
  
  await period.destroy();
  return true;
};

/**
 * Get periods with event counts
 * @returns {Array} - Periods with event counts
 */
const getPeriodsWithEventCounts = async () => {
  const periods = await Period.findAll({
    order: [['start_date', 'ASC']]
  });
  
  const periodsWithCounts = await Promise.all(periods.map(async (period) => {
    const eventCount = await Event.count({ where: { period_id: period.id } });
    return {
      ...period.toJSON(),
      event_count: eventCount
    };
  }));
  
  return periodsWithCounts;
};

module.exports = {
  getAllPeriods,
  getPeriodById,
  createPeriod,
  updatePeriod,
  deletePeriod,
  getPeriodsWithEventCounts
};
