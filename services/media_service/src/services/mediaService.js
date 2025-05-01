/**
 * Media Service
 * Business logic for media operations
 */
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
const Media = require('../../models/Media');
const { NotFoundError, ServiceError } = require('../utils/errorHandler');

/**
 * Get all media files
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Array of media objects
 */
const getAllMedia = async (filters = {}) => {
  const query = {};
  
  if (Object.keys(filters).length > 0) {
    query.where = filters;
  }
  
  return await Media.findAll(query);
};

/**
 * Get media by ID
 * @param {string} id - Media ID
 * @returns {Promise<Object>} Media object
 * @throws {NotFoundError} If media not found
 */
const getMediaById = async (id) => {
  const media = await Media.findByPk(id);
  
  if (!media) {
    throw new NotFoundError(`Media with ID ${id} not found`);
  }
  
  return media;
};

/**
 * Create new media
 * @param {Object} mediaData - Media data
 * @returns {Promise<Object>} Created media object
 */
const createMedia = async (mediaData) => {
  // Verify event exists by calling event service
  await verifyEventExists(mediaData.event_id);
  
  return await Media.create(mediaData);
};

/**
 * Update media
 * @param {string} id - Media ID
 * @param {Object} mediaData - Media data to update
 * @returns {Promise<Object>} Updated media object
 * @throws {NotFoundError} If media not found
 */
const updateMedia = async (id, mediaData) => {
  const media = await Media.findByPk(id);
  
  if (!media) {
    throw new NotFoundError(`Media with ID ${id} not found`);
  }
  
  await media.update(mediaData);
  return media;
};

/**
 * Delete media
 * @param {string} id - Media ID
 * @returns {Promise<boolean>} True if deletion successful
 * @throws {NotFoundError} If media not found
 */
const deleteMedia = async (id) => {
  const media = await Media.findByPk(id);
  
  if (!media) {
    throw new NotFoundError(`Media with ID ${id} not found`);
  }
  
  // Delete file from filesystem
  if (media.url && !media.url.startsWith('http')) {
    try {
      // Full path to file
      const filePath = path.join(process.cwd(), media.url);
      await fs.unlink(filePath);
      
      // Check if directory is empty and remove it if it is
      const dirPath = path.dirname(filePath);
      const files = await fs.readdir(dirPath);
      if (files.length === 0) {
        await fs.rmdir(dirPath);
      }
    } catch (err) {
      console.error(`Error deleting file: ${err.message}`);
      // Continue with database deletion even if file deletion fails
    }
  }
  
  await media.destroy();
  return true;
};

/**
 * Get media by event ID
 * @param {string} eventId - Event ID
 * @returns {Promise<Array>} Array of media objects
 */
const getMediaByEventId = async (eventId) => {
  // Verify event exists
  await verifyEventExists(eventId);
  
  return await Media.findAll({
    where: { event_id: eventId },
    order: [['created_at', 'DESC']]
  });
};

/**
 * Verify if an event exists by calling the event service
 * @param {string} eventId - Event ID to verify
 * @returns {Promise<boolean>} True if event exists
 * @throws {ServiceError} If event service is unavailable
 * @throws {NotFoundError} If event doesn't exist
 */
const verifyEventExists = async (eventId) => {
  try {
    const response = await fetch(`${process.env.EVENT_SERVICE_URL}/events/${eventId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundError(`Event with ID ${eventId} not found`);
      }
      throw new ServiceError(`Event service error: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new ServiceError(`Event service unavailable: ${error.message}`);
  }
};

module.exports = {
  getAllMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  getMediaByEventId
};
