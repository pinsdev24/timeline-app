/**
 * Event Controller
 * Handles HTTP requests for event operations
 */
const eventService = require('../services/eventService');
const { validateEvent } = require('../utils/validators');
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
 * Get all events
 * @route GET /events
 */
const getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event by ID
 * @route GET /events/:id
 */
const getEventById = async (req, res, next) => {
  try {
    const eventId = validateAndParseIntId(req.params.id, 'event ID');
    
    const event = await eventService.getEventById(eventId);
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new event
 * @route POST /events
 */
const createEvent = async (req, res, next) => {
  try {
    const validationErrors = validateEvent(req.body);
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.join(', '));
    }
    
    const newEvent = await eventService.createEvent(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an event
 * @route PUT /events/:id
 */
const updateEvent = async (req, res, next) => {
  try {
    const eventId = validateAndParseIntId(req.params.id, 'event ID');
    
    const validationErrors = validateEvent(req.body);
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.join(', '));
    }
    
    const updatedEvent = await eventService.updateEvent(eventId, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an event
 * @route DELETE /events/:id
 */
const deleteEvent = async (req, res, next) => {
  try {
    const eventId = validateAndParseIntId(req.params.id, 'event ID');
    
    await eventService.deleteEvent(eventId);
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get media files for an event
 * @route GET /events/:eventId/media
 */
const getMediasByEvent = async (req, res, next) => {
  try {
    const eventId = validateAndParseIntId(req.params.eventId, 'event ID');
    
    const media = await eventService.getMediasByEvent(eventId);
    
    res.status(200).json({
      success: true,
      count: media.length,
      data: media
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get media files for all events in a period
 * @route GET /periods/:periodId/media
 */
const getMediasByPeriod = async (req, res, next) => {
  try {
    const periodId = validateAndParseIntId(req.params.periodId, 'period ID');
    
    const media = await eventService.getMediasByPeriod(periodId);
    
    res.status(200).json({
      success: true,
      count: media.length,
      data: media
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get events by period
 * @route GET /periods/:periodId/events
 */
const getEventsByPeriod = async (req, res, next) => {
  try {
    const periodId = validateAndParseIntId(req.params.periodId, 'period ID');
    
    const events = await eventService.getEventsByPeriod(periodId);
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
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
