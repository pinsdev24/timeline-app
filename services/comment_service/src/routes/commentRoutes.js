/**
 * Comment Routes
 * Defines all routes for comment operations
 */
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes
router.get('/approved', commentController.getApprovedComments);
router.get('/event/:eventId', commentController.getCommentsByEvent);

// Protected routes (require authentication)
router.post('/', authenticateToken, commentController.createComment);

// Moderator/Admin only routes
router.get('/', authenticateToken, authorizeRoles(['moderator', 'admin']), commentController.getAllComments);
router.get('/pending', authenticateToken, authorizeRoles(['moderator', 'admin']), commentController.getPendingComments);
router.put('/:id/approve', authenticateToken, authorizeRoles(['moderator', 'admin']), commentController.approveComment);
router.delete('/:id', authenticateToken, authorizeRoles(['moderator', 'admin']), commentController.deleteComment);

module.exports = router;
