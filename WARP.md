# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Node.js REST API for Ayurvedic herb traceability, enabling farmers to submit harvest data with AI verification and geolocation validation. The system tracks herb harvests from farmers to consumers using unique batch IDs.

## Common Commands

### Development
```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Install dependencies
npm install
```

### Environment Setup
```bash
# Copy example environment file and configure
cp .env.example .env
```

### Database
```bash
# Start local MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Start MongoDB (Ubuntu)
sudo systemctl start mongod
```

### Testing API
```bash
# Check server health
curl http://localhost:3000/health

# Get API information
curl http://localhost:3000/api

# Submit a harvest (example)
curl -X POST http://localhost:3000/api/collection-events \
  -H "Content-Type: application/json" \
  -d '{
    "farmerName": "Test Farmer",
    "herbName": "Ashwagandha",
    "quantity": 25.5,
    "latitude": 28.6139,
    "longitude": 77.2090,
    "imageUrl": "https://example.com/herb.jpg"
  }'
```

## Architecture Overview

### Core Components
- **Express.js** server with comprehensive middleware stack (security, CORS, error handling)
- **MongoDB** with Mongoose ODM for data persistence
- **RESTful API** design following standard HTTP conventions
- **MVC pattern** with clear separation of routes, controllers, and models

### Key Architectural Features

#### Geographic Validation System
The system includes built-in geographic validation specifically for Indian coordinates:
- Validates coordinates are within India's boundaries (8.4° to 37.6° N, 68.7° to 97.25° E)
- Basic state detection using coordinate ranges
- Located in `utils/geoUtils.js` with `checkIndianCoordinates()` function

#### AI Simulation Layer
Current implementation includes AI verification simulation:
- 2-second processing delay to simulate real AI processing
- Confidence scoring between 90-98%
- Herb verification against common Ayurvedic herbs list
- Located in `utils/geoUtils.js` with `simulateAIVerification()` function

#### Data Model Architecture
The `CollectionEvent` model represents harvest events with:
- Auto-generated unique `batchId` for traceability
- Embedded location coordinates with validation
- AI verification results with confidence scores
- Geographic verification metadata
- Mongoose schema with comprehensive validation and indexing

#### API Response Patterns
All API responses follow consistent structure:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "pagination": object (for paginated results)
}
```

### Directory Structure
```
controllers/     # Business logic and request handling
models/         # Mongoose schemas and data models  
routes/         # API route definitions
utils/          # Utility functions (geo validation, AI simulation)
app.js          # Main application setup and middleware configuration
```

## Environment Variables

Required environment variables (see `.env.example`):
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `MONGODB_URI` - MongoDB connection string
- `API_VERSION` - API version identifier

## API Endpoints

### Core Endpoints
- `POST /api/collection-events` - Submit new harvest data
- `GET /api/collection-events` - Get all harvests with pagination/filtering
- `GET /api/collection-events/:batchId` - Get specific harvest by batch ID
- `GET /api/collection-events/stats` - Get statistics and analytics
- `GET /health` - Health check endpoint
- `GET /api` - API documentation endpoint

### Query Parameters for Filtering
- `page`, `limit` - Pagination
- `farmerName`, `herbName`, `state` - Content filtering

## Development Guidelines

### Mongoose Schema Patterns
- Use comprehensive validation with custom error messages
- Include both built-in and custom validators
- Implement proper indexing for query performance
- Use virtual fields for computed properties
- Include pre/post middleware for data processing

### Error Handling Strategy
The application implements a multi-layered error handling approach:
- Route-level validation and error responses
- Global error middleware in `app.js` for Mongoose errors, validation errors, and unexpected errors
- Graceful shutdown handlers for SIGTERM/SIGINT
- Environment-specific error detail levels

### Geographic Validation Implementation
When working with location data:
- Always validate coordinates are within expected ranges
- Use the existing `checkIndianCoordinates()` function for India-specific validation
- Consider implementing proper geocoding services for production use
- State detection is currently simplified and should be enhanced for accuracy

### AI Integration Patterns
Current AI simulation provides a template for real AI integration:
- Async processing with appropriate delays
- Confidence scoring mechanisms
- Herb verification against known lists
- Structured response format for AI results

## Database Considerations

### Indexing Strategy
Current indexes on CollectionEvent:
- `batchId` (unique identifier)
- `farmerName` (farmer-based queries)
- `herbName` (herb-based filtering)  
- `timestamp` (chronological sorting)

### Aggregation Patterns
The stats endpoint demonstrates MongoDB aggregation for:
- Grouping by herb type with count and quantity totals
- State-wise distribution analysis
- Confidence score averaging
- Filtering with match stages

## Security Implementation

The application includes several security measures:
- **Helmet.js** for security headers
- **CORS** configuration with environment-specific origins
- Input validation at multiple layers
- Secure error responses (hiding stack traces in production)
- Request size limits for body parsing

## Future Integration Points

The codebase is structured to accommodate:
- Real AI/ML service integration (replace simulation functions)
- Authentication/authorization systems
- Advanced geocoding services
- Blockchain integration for immutable records
- Real-time notification systems
- Advanced analytics and reporting

When implementing these features, follow the established patterns for error handling, response formatting, and middleware integration.
