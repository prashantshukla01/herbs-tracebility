const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const collectionEventsRoutes = require('./routes/collectionEvents');

// Create Express app
const app = express();

// Environment variables with defaults
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayurvedic-herb-traceability';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Middleware Configuration
 */

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API-only server
}));

// CORS configuration
app.use(cors({
  origin: NODE_ENV === 'production' ? 
    ['https://your-frontend-domain.com'] : // Replace with actual production domains
    ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000', 'http://127.0.0.1:5500'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for image URLs
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (only in development)
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/**
 * Database Connection
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // Modern Mongoose connection options
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    
    // In production, you might want to retry connection or exit gracefully
    if (NODE_ENV === 'production') {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    } else {
      console.error('Database connection failed. Server will start but API calls may fail.');
    }
  }
};

// Connect to database
connectDB();

/**
 * API Routes
 */

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ayurvedic Herb Traceability API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    mongodb_status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ayurvedic Herb Traceability API',
    version: '1.0.0',
    description: 'API for tracking and verifying Ayurvedic herb harvest data',
    endpoints: {
      'POST /api/collection-events': 'Submit a new harvest',
      'GET /api/collection-events': 'Get all collection events (with pagination and filters)',
      'GET /api/collection-events/:batchId': 'Get specific collection event by batch ID',
      'GET /api/collection-events/stats': 'Get collection events statistics',
      'GET /health': 'Health check',
      'GET /api': 'API information'
    },
    documentation: 'See README.md for detailed API usage'
  });
});

// Collection events routes
app.use('/api/collection-events', collectionEventsRoutes);

/**
 * Error Handling Middleware
 */

// Handle 404 - Route not found
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /health',
      'GET /api',
      'POST /api/collection-events',
      'GET /api/collection-events',
      'GET /api/collection-events/stats',
      'GET /api/collection-events/:batchId'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose CastError (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate value for field: ${field}`
    });
  }

  // JSON parsing error
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body'
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

/**
 * Graceful Shutdown Handlers
 */
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // Close HTTP server
  server.close((err) => {
    if (err) {
      console.error('Error during HTTP server shutdown:', err);
      process.exit(1);
    }
    
    console.log('HTTP server closed.');
    
    // Close database connection
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
};

// Handle process termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

/**
 * Start Server
 */
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🌿 AYURVEDIC HERB TRACEABILITY API 🌿');
  console.log('='.repeat(50));
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API info: http://localhost:${PORT}/api`);
  console.log(`API base URL: http://localhost:${PORT}/api`);
  console.log('='.repeat(50));
});

module.exports = app;
