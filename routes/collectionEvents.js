const express = require('express');
const router = express.Router();
const {
  createCollectionEvent,
  getAllCollectionEvents,
  getCollectionEventByBatchId,
  getCollectionEventsStats
} = require('../controllers/collectionEventController');

/**
 * @route   POST /api/collection-events
 * @desc    Submit a new harvest (for farmers)
 * @access  Public
 * @body    { farmerName, herbName, quantity, latitude, longitude, imageUrl }
 */
router.post('/', createCollectionEvent);

/**
 * @route   GET /api/collection-events/stats
 * @desc    Get collection events statistics
 * @access  Public
 * @note    This route must be defined BEFORE the /:batchId route to avoid conflicts
 */
router.get('/stats', getCollectionEventsStats);

/**
 * @route   GET /api/collection-events
 * @desc    Get all collection events (for company dashboard)
 * @access  Public
 * @query   page, limit, farmerName, herbName, state (optional filters)
 */
router.get('/', getAllCollectionEvents);

/**
 * @route   GET /api/collection-events/:batchId
 * @desc    Get a specific collection event by batch ID (for consumer portal)
 * @access  Public
 * @param   batchId - The unique batch identifier
 */
router.get('/:batchId', getCollectionEventByBatchId);

module.exports = router;
