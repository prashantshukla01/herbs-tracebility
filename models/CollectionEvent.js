const mongoose = require('mongoose');

/**
 * Collection Event Schema for Ayurvedic herb traceability
 * Represents a harvest event submitted by farmers
 */
const collectionEventSchema = new mongoose.Schema({
  // Auto-generated unique batch identifier
  batchId: {
    type: String,
    unique: true,
    default: function() {
      return `BATCH-${Date.now()}`;
    }
  },
  
  // Farmer information
  farmerName: {
    type: String,
    required: [true, 'Farmer name is required'],
    trim: true,
    maxlength: [100, 'Farmer name cannot exceed 100 characters']
  },
  
  // Herb information
  herbName: {
    type: String,
    required: [true, 'Herb name is required'],
    trim: true,
    maxlength: [50, 'Herb name cannot exceed 50 characters']
  },
  
  // Quantity in appropriate units (e.g., kg, tons)
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.01, 'Quantity must be greater than 0']
  },
  
  // Geographic location of harvest
  location: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  
  // Image URL for verification
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  
  // Timestamp of the harvest event
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  // AI verification results
  aiVerification: {
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    verifiedHerb: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // Additional metadata for geo-verification
  geoVerification: {
    country: String,
    state: String,
    isWithinIndia: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Index for efficient querying
collectionEventSchema.index({ batchId: 1 });
collectionEventSchema.index({ farmerName: 1 });
collectionEventSchema.index({ herbName: 1 });
collectionEventSchema.index({ timestamp: -1 });

// Virtual for location string representation
collectionEventSchema.virtual('locationString').get(function() {
  return `${this.location.latitude}, ${this.location.longitude}`;
});

// Pre-save middleware to ensure batchId uniqueness
collectionEventSchema.pre('save', async function(next) {
  if (this.isNew && !this.batchId) {
    this.batchId = `BATCH-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('CollectionEvent', collectionEventSchema);
