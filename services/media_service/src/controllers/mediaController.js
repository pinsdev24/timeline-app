/**
 * Media Controller
 * Handles HTTP requests for media operations
 */
const mediaService = require('../services/mediaService');
const { ValidationError } = require('../utils/errorHandler');
const { getMediaTypeFromMimetype, validateAndParseIntId } = require('../utils/validation');
const path = require('path');

/**
 * Get all media
 * @route GET /api/media
 */
const getAllMedia = async (req, res, next) => {
  try {
    const filters = {};
    
    // Apply filters if provided
    if (req.query.type) {
      filters.type = req.query.type;
    }
    
    if (req.query.event_id) {
      if (!validateAndParseIntId(req.query.event_id, 'event_id')) {
        return next(new ValidationError('Invalid event ID format'));
      }
      filters.event_id = req.query.event_id;
    }
    
    const media = await mediaService.getAllMedia(filters);
    
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
 * Get media by ID
 * @route GET /api/media/:id
 */
const getMediaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!validateAndParseIntId(id, 'media_id')) {
      return next(new ValidationError('Invalid media ID format'));
    }
    
    const media = await mediaService.getMediaById(id);
    
    res.status(200).json({
      success: true,
      data: media
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new media
 * @route POST /api/media
 */
const createMedia = async (req, res, next) => {
  try {
    // Validate required fields
    if (!req.body.event_id) {
      return next(new ValidationError('Event ID is required'));
    }
    
    if (!validateAndParseIntId(req.body.event_id, 'event_id')) {
      return next(new ValidationError('Invalid event ID format'));
    }
    
    // Handle upload with or without file
    let mediaData = {
      ...req.body,
      uploader_id: req.user.id
    };
    
    // If it's a file upload
    if (req.file) {
      // Generate relative path to file for storage
      const relativePath = path.relative(
        process.cwd(),
        req.file.path
      ).replace(/\\/g, '/'); // Normalize for all OS
      
      mediaData = {
        ...mediaData,
        type: getMediaTypeFromMimetype(req.file.mimetype),
        url: relativePath,
      };
    } 
    // If it's an external URL
    else if (req.body.url) {
      if (!req.body.type) {
        return next(new ValidationError('Media type is required for external URLs'));
      }
      
      mediaData = {
        ...mediaData,
        type: req.body.type,
        url: req.body.url
      };
    } else {
      return next(new ValidationError('Either a file, text, or URL must be provided'));
    }
    
    const media = await mediaService.createMedia(mediaData);
    
    res.status(201).json({
      success: true,
      message: 'Media created successfully',
      data: media
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update media
 * @route PUT /api/media/:id
 */
const updateMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!validateAndParseIntId(id, 'media_id')) {
      return next(new ValidationError('Invalid media ID format'));
    }
    
    // Prevent updating critical fields
    const protectedFields = ['id', 'url', 'type', 'filename', 'mimetype', 'size', 'uploader_id'];
    const mediaData = { ...req.body };
    
    protectedFields.forEach(field => {
      if (mediaData[field]) {
        delete mediaData[field];
      }
    });
    
    // Update allowed fields (text, is_public, event_id)
    const media = await mediaService.updateMedia(id, mediaData);
    
    res.status(200).json({
      success: true,
      message: 'Media updated successfully',
      data: media
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete media
 * @route DELETE /api/media/:id
 */
const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!validateAndParseIntId(id, 'media_id')) {
      return next(new ValidationError('Invalid media ID format'));
    }
    
    await mediaService.deleteMedia(id);
    
    res.status(200).json({
      success: true,
      message: 'Media deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get media for an event
 * @route GET /api/media/event/:eventId
 */
const getMediaByEventId = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    if (!validateAndParseIntId(eventId, 'event_id')) {
      return next(new ValidationError('Invalid event ID format'));
    }
    
    const media = await mediaService.getMediaByEventId(eventId);
    
    res.status(200).json({
      success: true,
      count: media.length,
      data: media
    });
  } catch (error) {
    next(error);
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
