/**
 * Event Service
 * Handles business logic for event operations
 */
const Event = require('../models/event');
const { NotFoundError, ServiceError } = require('../utils/errorHandler');
const fetch = require('node-fetch');
const config = require('../config');

/**
 * Get all events
 * @returns {Array} - All events
 */
const getAllEvents = async () => {
  return await Event.findAll();
};

/**
 * Get event by ID
 * @param {String} id - Event ID
 * @returns {Object} - Event object
 */
const getEventById = async (id) => {
  const event = await Event.findByPk(id);
  
  if (!event) {
    throw new NotFoundError('Event not found');
  }
  
  return event;
};

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @returns {Object} - Created event
 */
const createEvent = async (eventData) => {
  return await Event.create(eventData);
};

/**
 * Update an event
 * @param {String} id - Event ID
 * @param {Object} eventData - New event data
 * @returns {Object} - Updated event
 */
const updateEvent = async (id, eventData) => {
  const event = await getEventById(id);
  
  await event.update(eventData);
  return event;
};

/**
 * Delete an event
 * @param {String} id - Event ID
 * @returns {Boolean} - Success status
 */
const deleteEvent = async (id) => {
  const event = await getEventById(id);
  
  await event.destroy();
  return true;
};

/**
 * Get media files for an event
 * @param {String} eventId - Event ID
 * @returns {Array} - Media files
 */
const getMediasByEvent = async (eventId) => {
  try {
    const mediaServiceUrl = process.env.MEDIA_SERVICE_URL || 'http://localhost:3001';
    const response = await fetch(`${mediaServiceUrl}/api/media/event/${eventId}`);
    
    if (!response.ok) {
      throw new ServiceError(`Media service error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new ServiceError(`Failed to communicate with media service: ${error.message}`);
  }
};

/**
 * Get media files for all events in a period
 * @param {String} periodId - Period ID
 * @returns {Array} - Media files
 */
const getMediasByPeriod = async (periodId) => {
  const events = await Event.findAll({ where: { period_id: periodId } });
  const eventIds = events.map(event => event.id);

  if (eventIds.length === 0) {
    return [];
  }

  try {
    const mediaServiceUrl = process.env.MEDIA_SERVICE_URL || 'http://localhost:3001';
    const response = await fetch(`${mediaServiceUrl}/api/media/event/${eventIds}`);

    if (!response.ok) {
      throw new ServiceError(`Media service error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new ServiceError(`Failed to communicate with media service: ${error.message}`);
  }
};

/**
 * Get events by period
 * @param {String} periodId - Period ID
 * @returns {Array} - Events in the period
 */
const getEventsByPeriod = async (periodId) => {
  return await Event.findAll({ 
    where: { period_id: periodId },
    order: [['date', 'ASC']]
  });
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMediasByEvent,
  getMediasByPeriod,
  getEventsByPeriod
};
