/**
 * Period Routes
 * Defines all routes for period operations
 */
const express = require('express');
const router = express.Router();
const periodController = require('../controllers/periodController');
const eventController = require('../controllers/eventController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes
router.get('/', periodController.getAllPeriods);
router.get('/with-counts', periodController.getPeriodsWithEventCounts);
router.get('/:id', periodController.getPeriodById);
router.get('/:periodId/events', eventController.getEventsByPeriod);
router.get('/:periodId/media', eventController.getMediasByPeriod);

// Protected routes (require authentication)
router.post('/', authenticateToken, authorizeRoles(['admin', 'moderator']), periodController.createPeriod);
router.put('/:id', authenticateToken, authorizeRoles(['admin', 'moderator']), periodController.updatePeriod);
router.delete('/:id', authenticateToken, authorizeRoles(['admin', 'moderator']), periodController.deletePeriod);

module.exports = router;
