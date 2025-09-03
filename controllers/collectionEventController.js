const CollectionEvent = require('../models/CollectionEvent');
const { checkIndianCoordinates, simulateAIVerification } = require('../utils/geoUtils');

/**
 * Create a new collection event (harvest submission)
 * POST /api/collection-events
 */
const createCollectionEvent = async (req, res) => {
  try {
    const { farmerName, herbName, quantity, latitude, longitude, imageUrl } = req.body;

    // Validate required fields
    if (!farmerName || !herbName || !quantity || !latitude || !longitude || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: farmerName, herbName, quantity, latitude, longitude, imageUrl'
      });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    // Perform geo-check to verify location within India
    const geoVerification = checkIndianCoordinates(latitude, longitude);
    
    console.log(`Geo-check for coordinates (${latitude}, ${longitude}):`, geoVerification);

    // Simulate AI verification (2-second delay)
    console.log('Starting AI verification process...');
    const aiResult = await simulateAIVerification(herbName, imageUrl);
    console.log('AI verification completed:', aiResult);

    // Create the collection event data
    const collectionEventData = {
      farmerName,
      herbName,
      quantity,
      location: {
        latitude,
        longitude
      },
      imageUrl,
      aiVerification: {
        confidence: aiResult.confidence,
        verifiedHerb: aiResult.verifiedHerb
      },
      geoVerification: {
        country: geoVerification.country,
        state: geoVerification.state,
        isWithinIndia: geoVerification.isWithinIndia
      }
    };

    // Save to database
    const collectionEvent = new CollectionEvent(collectionEventData);
    const savedEvent = await collectionEvent.save();

    // Return success response with the specified format
    res.status(201).json({
      success: true,
      message: 'Harvest submitted successfully',
      data: {
        batchId: savedEvent.batchId,
        farmerName: savedEvent.farmerName,
        herbName: savedEvent.herbName,
        quantity: savedEvent.quantity,
        location: savedEvent.location,
        imageUrl: savedEvent.imageUrl,
        timestamp: savedEvent.timestamp,
        aiVerification: {
          confidence: savedEvent.aiVerification.confidence,
          verifiedHerb: savedEvent.aiVerification.verifiedHerb
        },
        geoVerification: savedEvent.geoVerification
      }
    });

  } catch (error) {
    console.error('Error creating collection event:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessages
      });
    }

    // Handle duplicate batchId error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate batch ID. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error occurred while creating collection event'
    });
  }
};

/**
 * Get all collection events (for company dashboard)
 * GET /api/collection-events
 */
const getAllCollectionEvents = async (req, res) => {
  try {
    // Parse query parameters for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Optional filters
    const filter = {};
    if (req.query.farmerName) {
      filter.farmerName = { $regex: req.query.farmerName, $options: 'i' };
    }
    if (req.query.herbName) {
      filter.herbName = { $regex: req.query.herbName, $options: 'i' };
    }
    if (req.query.state) {
      filter['geoVerification.state'] = { $regex: req.query.state, $options: 'i' };
    }

    // Get total count for pagination
    const totalEvents = await CollectionEvent.countDocuments(filter);
    
    // Fetch collection events with pagination
    const collectionEvents = await CollectionEvent.find(filter)
      .sort({ timestamp: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Collection events retrieved successfully',
      data: collectionEvents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalEvents / limit),
        totalEvents,
        eventsPerPage: limit,
        hasNextPage: page < Math.ceil(totalEvents / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching collection events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error occurred while fetching collection events'
    });
  }
};

/**
 * Get a specific collection event by batch ID (for consumer portal)
 * GET /api/collection-events/:batchId
 */
const getCollectionEventByBatchId = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required'
      });
    }

    // Find the collection event by batch ID
    const collectionEvent = await CollectionEvent.findOne({ batchId });

    if (!collectionEvent) {
      return res.status(404).json({
        success: false,
        message: 'Collection event not found with the provided batch ID'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Collection event retrieved successfully',
      data: collectionEvent
    });

  } catch (error) {
    console.error('Error fetching collection event by batch ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error occurred while fetching collection event'
    });
  }
};

/**
 * Get collection events statistics (bonus endpoint)
 * GET /api/collection-events/stats
 */
const getCollectionEventsStats = async (req, res) => {
  try {
    const totalEvents = await CollectionEvent.countDocuments();
    const eventsWithinIndia = await CollectionEvent.countDocuments({ 'geoVerification.isWithinIndia': true });
    
    // Get herb distribution
    const herbStats = await CollectionEvent.aggregate([
      {
        $group: {
          _id: '$herbName',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          avgConfidence: { $avg: '$aiVerification.confidence' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get state distribution (only for Indian locations)
    const stateStats = await CollectionEvent.aggregate([
      { $match: { 'geoVerification.isWithinIndia': true } },
      {
        $group: {
          _id: '$geoVerification.state',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        overview: {
          totalEvents,
          eventsWithinIndia,
          eventsOutsideIndia: totalEvents - eventsWithinIndia,
          verificationRate: totalEvents > 0 ? ((eventsWithinIndia / totalEvents) * 100).toFixed(2) : 0
        },
        herbDistribution: herbStats,
        stateDistribution: stateStats
      }
    });

  } catch (error) {
    console.error('Error fetching collection events statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error occurred while fetching statistics'
    });
  }
};

module.exports = {
  createCollectionEvent,
  getAllCollectionEvents,
  getCollectionEventByBatchId,
  getCollectionEventsStats
};
