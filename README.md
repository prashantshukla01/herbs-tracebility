# Ayurvedic Herb Traceability API

A scalable Node.js backend system for tracking and verifying Ayurvedic herb harvests from farmers to consumers. This API provides comprehensive traceability features including AI-powered herb verification and geolocation validation.

## 🌿 Features

- **Harvest Submission**: Farmers can submit harvest data with location and images
- **AI Verification**: Simulated AI service verifies herb authenticity with confidence scores
- **Geo-Validation**: Automatic verification of harvest locations within India
- **Batch Tracking**: Unique batch IDs for complete traceability
- **Dashboard Support**: APIs for company dashboards and consumer portals
- **Statistical Analysis**: Comprehensive reporting and analytics

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14.x or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ayurvedic-herb-traceability
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Configure Environment Variables**
   
   Edit `.env` file:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ayurvedic-herb-traceability
   API_VERSION=v1
   ```

5. **Start MongoDB**
   
   **Local MongoDB:**
   ```bash
   # Start MongoDB service (varies by OS)
   # macOS with Homebrew:
   brew services start mongodb-community
   
   # Ubuntu:
   sudo systemctl start mongod
   
   # Windows: Start MongoDB from Services or command line
   ```

   **MongoDB Atlas:**
   - Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Get your connection string and update `MONGODB_URI` in `.env`

6. **Start the Server**
   
   **Development mode:**
   ```bash
   npm run dev
   ```
   
   **Production mode:**
   ```bash
   npm start
   ```

## 🔗 API Endpoints

Base URL: `http://localhost:3000/api`

### Health Check
```http
GET /health
```
Returns server status and database connection info.

### API Information
```http
GET /api
```
Returns API documentation and available endpoints.

### Collection Events

#### 1. Submit New Harvest
```http
POST /api/collection-events
```

**Request Body:**
```json
{
  "farmerName": "Ravi Kumar",
  "herbName": "Ashwagandha",
  "quantity": 25.5,
  "latitude": 28.6139,
  "longitude": 77.2090,
  "imageUrl": "https://example.com/herb-image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Harvest submitted successfully",
  "data": {
    "batchId": "BATCH-1694567890123",
    "farmerName": "Ravi Kumar",
    "herbName": "Ashwagandha",
    "quantity": 25.5,
    "location": {
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "imageUrl": "https://example.com/herb-image.jpg",
    "timestamp": "2023-09-12T14:30:00.000Z",
    "aiVerification": {
      "confidence": 95,
      "verifiedHerb": "Ashwagandha"
    },
    "geoVerification": {
      "country": "India",
      "state": "Delhi/Haryana",
      "isWithinIndia": true
    }
  }
}
```

#### 2. Get All Harvests (Dashboard)
```http
GET /api/collection-events
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `farmerName` (optional): Filter by farmer name
- `herbName` (optional): Filter by herb name
- `state` (optional): Filter by state

**Example:**
```http
GET /api/collection-events?page=1&limit=5&herbName=Ashwagandha
```

#### 3. Get Specific Batch (Consumer Portal)
```http
GET /api/collection-events/:batchId
```

**Example:**
```http
GET /api/collection-events/BATCH-1694567890123
```

#### 4. Get Statistics
```http
GET /api/collection-events/stats
```

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "overview": {
      "totalEvents": 150,
      "eventsWithinIndia": 145,
      "eventsOutsideIndia": 5,
      "verificationRate": "96.67"
    },
    "herbDistribution": [
      {
        "_id": "Ashwagandha",
        "count": 45,
        "totalQuantity": 1250.5,
        "avgConfidence": 94.2
      }
    ],
    "stateDistribution": [
      {
        "_id": "Maharashtra",
        "count": 30,
        "totalQuantity": 850.0
      }
    ]
  }
}
```

## 📁 Project Structure

```
ayurvedic-herb-traceability/
├── controllers/           # Route controllers
│   └── collectionEventController.js
├── models/               # Mongoose models
│   └── CollectionEvent.js
├── routes/               # Express routes
│   └── collectionEvents.js
├── utils/                # Utility functions
│   └── geoUtils.js
├── middleware/           # Custom middleware (future use)
├── config/               # Configuration files (future use)
├── app.js                # Main application file
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
└── README.md            # Documentation
```

## 🧪 Testing the API

### Using curl

**Submit a harvest:**
```bash
curl -X POST http://localhost:3000/api/collection-events \
  -H "Content-Type: application/json" \
  -d '{
    "farmerName": "Priya Sharma",
    "herbName": "Turmeric",
    "quantity": 15.5,
    "latitude": 19.0760,
    "longitude": 72.8777,
    "imageUrl": "https://example.com/turmeric.jpg"
  }'
```

**Get all harvests:**
```bash
curl http://localhost:3000/api/collection-events
```

**Get specific batch:**
```bash
curl http://localhost:3000/api/collection-events/BATCH-1694567890123
```

### Using Postman

1. Import the following endpoints into Postman
2. Set the base URL to `http://localhost:3000`
3. Use the examples above for request bodies

## 🔧 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

### Code Style

- Use ES6+ features
- Follow RESTful API conventions
- Include comprehensive error handling
- Write descriptive comments
- Use consistent naming conventions

## 📊 Database Schema

### CollectionEvent Model

```javascript
{
  batchId: String (unique, auto-generated),
  farmerName: String (required),
  herbName: String (required),
  quantity: Number (required, > 0),
  location: {
    latitude: Number (required, -90 to 90),
    longitude: Number (required, -180 to 180)
  },
  imageUrl: String (required),
  timestamp: Date (auto-generated),
  aiVerification: {
    confidence: Number (0-100),
    verifiedHerb: String
  },
  geoVerification: {
    country: String,
    state: String,
    isWithinIndia: Boolean
  }
}
```

## 🌍 Geographic Validation

The API includes built-in geographic validation for Indian coordinates:

- **Latitude Range**: 8.4° to 37.6° N
- **Longitude Range**: 68.7° to 97.25° E
- **State Detection**: Basic state identification based on coordinate ranges
- **Future Enhancement**: Integration with proper geocoding services

## 🤖 AI Simulation

The current implementation includes AI simulation features:

- **Processing Delay**: 2-second simulation of AI processing
- **Confidence Scoring**: Random confidence between 90-98%
- **Herb Verification**: Validates against common Ayurvedic herbs
- **Future Enhancement**: Integration with actual AI/ML services

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin request handling
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses
- **Rate Limiting**: (To be implemented)

## 🚧 Future Enhancements

- [ ] Authentication and authorization
- [ ] Rate limiting
- [ ] Real AI integration
- [ ] Blockchain integration for immutable records
- [ ] Advanced geographic services
- [ ] Image storage and processing
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app integration
- [ ] Multi-language support

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please contact:
- Email: support@ayurvedic-traceability.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

## 🙏 Acknowledgments

- Ayurvedic medicine practitioners for domain knowledge
- Open source community for excellent tools and libraries
- MongoDB and Node.js communities for robust platforms
