/**
 * Media Routes
 * API endpoints for media operations
 */
const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { protect, restrictTo } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

// Get all media files (public endpoint)
router.get('/', mediaController.getAllMedia);

// Get media by ID (public endpoint)
router.get('/:id', mediaController.getMediaById);

// Get media by event ID (public endpoint)
router.get('/event/:eventId', mediaController.getMediaByEventId);

// Protected routes below - require authentication
// Create new media with file upload
router.post(
  '/',
  protect,
  restrictTo('moderator', 'admin'),
  upload.single('file'),
  handleMulterError,
  mediaController.createMedia
);

// Update media metadata
router.put(
  '/:id',
  protect,
  restrictTo('moderator', 'admin'),
  mediaController.updateMedia
);

// Delete media
router.delete(
  '/:id',
  protect,
  restrictTo('moderator', 'admin'),
  mediaController.deleteMedia
);

module.exports = router;
