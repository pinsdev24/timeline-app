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
 * @returns {Array} - All events with their associated media
 */
const getAllEvents = async () => {
  const events = await Event.findAll();
  
  // Fetch media for each event in parallel
  const eventsWithMedia = await Promise.all(
    events.map(async (event) => {
      try {
        const eventData = event.toJSON();
        const media = await getMediasByEvent(event.id);
        return {
          ...eventData,
          medias: media
        };
      } catch (error) {
        console.error(`Error fetching media for event ${event.id}:`, error.message);
        // Return the event without media if fetching media fails
        return {
          ...event.toJSON(),
          medias: []
        };
      }
    })
  );
  
  return eventsWithMedia;
};

/**
 * Get event by ID
 * @param {number} id - Event ID
 * @returns {Object} - Event object with associated media
 */
const getEventById = async (id) => {
  const event = await Event.findByPk(id);
  
  if (!event) {
    throw new NotFoundError('Event not found');
  }
  
  try {
    const eventData = event.toJSON();
    const media = await getMediasByEvent(id);
    
    return {
      ...eventData,
      medias: media
    };
  } catch (error) {
    console.error(`Error fetching media for event ${id}:`, error.message);
    // Return the event without media if fetching media fails
    return {
      ...event.toJSON(),
      medias: []
    };
  }
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
 * @param {number} eventId - Event ID
 * @returns {Array} - Media files
 */
const getMediasByEvent = async (eventId) => {
  try {
    const mediaServiceUrl = config.services.media;
    const response = await fetch(`${mediaServiceUrl}/api/media/event/${eventId}`);
    
    if (!response.ok) {
      throw new ServiceError(`Media service error: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new ServiceError(`Failed to communicate with media service: ${error.message}`);
  }
};

/**
 * Get media files for all events in a period
 * @param {number} periodId - Period ID
 * @returns {Array} - Media files
 */
const getMediasByPeriod = async (periodId) => {
  const events = await Event.findAll({ where: { period_id: periodId } });
  const eventIds = events.map(event => event.id);

  if (eventIds.length === 0) {
    return [];
  }

  try {
    const mediaServiceUrl = config.services.media;
    const response = await fetch(`${mediaServiceUrl}/api/media/event/${eventIds}`);

    if (!response.ok) {
      throw new ServiceError(`Media service error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new ServiceError(`Failed to communicate with media service: ${error.message}`);
  }
};

/**
 * Get events by period
 * @param {number} periodId - Period ID
 * @returns {Array} - Events in the period with their associated media
 */
const getEventsByPeriod = async (periodId) => {
  const events = await Event.findAll({ 
    where: { period_id: periodId },
    order: [['date', 'ASC']]
  });
  
  // Fetch media for each event in parallel
  const eventsWithMedia = await Promise.all(
    events.map(async (event) => {
      try {
        const eventData = event.toJSON();
        const media = await getMediasByEvent(event.id);
        return {
          ...eventData,
          medias: media
        };
      } catch (error) {
        console.error(`Error fetching media for event ${event.id}:`, error.message);
        // Return the event without media if fetching media fails
        return {
          ...event.toJSON(),
          medias: []
        };
      }
    })
  );
  
  return eventsWithMedia;
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
