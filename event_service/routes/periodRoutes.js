const express = require('express');
const periodController = require('../controllers/periodController');
const router = express.Router();

router.get('/', periodController.getAllPeriods);
router.get('/:id', periodController.getPeriodById);
router.post('/', periodController.createPeriod);
router.put('/:id', periodController.updatePeriod);
router.delete('/:id', periodController.deletePeriod);

module.exports = router;