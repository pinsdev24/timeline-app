const express = require('express');
const eventController = require('../controllers/eventController');
const router = express.Router();

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.post('/', eventController.createEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.get('/medias/by-event/:eventId', eventController.getMediasByEvent);
router.get('/medias/by-period/:periodId', eventController.getMediasByPeriod);

module.exports = router;