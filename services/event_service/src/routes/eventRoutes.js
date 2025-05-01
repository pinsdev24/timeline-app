/**
 * Event Routes
 * Defines all routes for event operations
 */
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.get('/:eventId/media', eventController.getMediasByEvent);

// Protected routes (require authentication)
router.post('/', authenticateToken, eventController.createEvent);
router.put('/:id', authenticateToken, eventController.updateEvent);
router.delete('/:id', authenticateToken, authorizeRoles(['admin', 'moderator']), eventController.deleteEvent);

module.exports = router;
