import React, { useState } from 'react';
import { Search, MapPin, Calendar, Shield, User, Leaf, Loader, CheckCircle, XCircle, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { apiService } from '../services/api';
import { formatDate, formatCoordinates, getConfidenceBadge } from '../utils/helpers';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ConsumerPortalView = () => {
  const [batchId, setBatchId] = useState('');
  const [harvestData, setHarvestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle batch ID lookup
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!batchId.trim()) {
      setError('Please enter a batch ID');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getCollectionEventByBatchId(batchId.trim());
      setHarvestData(response.data);
    } catch (error) {
      console.error('Failed to fetch batch data:', error);
      if (error.response?.status === 404) {
        setError(`Batch ID "${batchId}" not found. Please check the ID and try again.`);
      } else {
        setError('Failed to retrieve batch information. Please try again.');
      }
      setHarvestData(null);
    } finally {
      setLoading(false);
    }
  };

  // Clear results
  const handleClear = () => {
    setBatchId('');
    setHarvestData(null);
    setError(null);
  };

  // Timeline component
  const Timeline = ({ data }) => {
    const timelineSteps = [
      {
        title: 'Harvest Recorded',
        description: `Herb harvested by ${data.farmerName}`,
        timestamp: data.timestamp,
        icon: Leaf,
        status: 'completed'
      },
      {
        title: 'Location Verified',
        description: `Coordinates verified in ${data.geoVerification?.state}, ${data.geoVerification?.country}`,
        timestamp: data.timestamp,
        icon: MapPin,
        status: data.geoVerification?.isWithinIndia ? 'completed' : 'warning'
      },
      {
        title: 'AI Verification',
        description: `Herb verified as ${data.aiVerification?.verifiedHerb} with ${data.aiVerification?.confidence}% confidence`,
        timestamp: data.timestamp,
        icon: Shield,
        status: data.aiVerification?.confidence >= 90 ? 'completed' : 'warning'
      },
      {
        title: 'Ready for Distribution',
        description: 'Batch is verified and ready for the supply chain',
        timestamp: data.timestamp,
        icon: CheckCircle,
        status: 'completed'
      }
    ];

    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Traceability Timeline</h3>
        
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200"></div>
          
          {timelineSteps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === timelineSteps.length - 1;
            
            return (
              <div key={index} className="relative flex items-start mb-8 last:mb-0">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  step.status === 'completed'
                    ? 'bg-green-100 text-green-600'
                    : step.status === 'warning'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                {/* Content */}
                <div className="ml-6 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">{step.title}</h4>
                    <span className="text-sm text-gray-500">{formatDate(step.timestamp)}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{step.description}</p>
                  
                  {step.status === 'warning' && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                      ⚠️ This step has some concerns that may need attention.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Herb details component
  const HerbDetails = ({ data }) => {
    const confidenceBadge = getConfidenceBadge(data.aiVerification?.confidence);
    
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Herb Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Herb Name</label>
              <p className="text-lg font-semibold text-gray-900">{data.herbName}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Quantity</label>
              <p className="text-lg text-gray-900">{data.quantity} kg</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Batch ID</label>
              <p className="text-lg text-gray-900 font-mono">{data.batchId}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Harvest Date</label>
              <p className="text-lg text-gray-900">{formatDate(data.timestamp)}</p>
            </div>
          </div>
          
          {/* Farmer and Location */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Farmer</label>
              <div className="flex items-center mt-1">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <p className="text-lg text-gray-900">{data.farmerName}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Location</label>
              <div className="flex items-start mt-1">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-lg text-gray-900">
                    {data.geoVerification?.state}, {data.geoVerification?.country}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCoordinates(data.location?.latitude, data.location?.longitude)}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">AI Verification</label>
              <div className="flex items-center mt-1">
                <Shield className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${confidenceBadge.color}`}>
                    {data.aiVerification?.confidence}% Confidence
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    Verified as: {data.aiVerification?.verifiedHerb}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Image Section */}
        {data.imageUrl && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-500 mb-2">Herb Image</label>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="text-gray-500">
                <Leaf className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Image URL: {data.imageUrl}</p>
                <p className="text-xs text-gray-400 mt-1">
                  (In a real application, this would display the actual image)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Map component
  const HarvestMap = ({ data }) => {
    if (!data.location?.latitude || !data.location?.longitude) {
      return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Harvest Location</h3>
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2" />
            <p>Location data not available for this batch</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Harvest Location</h3>
        <div className="h-64 rounded-lg overflow-hidden">
          <MapContainer
            center={[data.location.latitude, data.location.longitude]}
            zoom={12}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[data.location.latitude, data.location.longitude]}>
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold">{data.herbName}</h4>
                  <p className="text-sm">Farmer: {data.farmerName}</p>
                  <p className="text-sm">Quantity: {data.quantity} kg</p>
                  <p className="text-xs text-gray-500">
                    {formatCoordinates(data.location.latitude, data.location.longitude)}
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>📍 {data.geoVerification?.state}, {data.geoVerification?.country}</p>
          <p>🌍 {formatCoordinates(data.location.latitude, data.location.longitude)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Consumer Portal</h1>
        <p className="mt-2 text-gray-600">Track your herb's journey from farm to you</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Batch ID to track your herb
            </label>
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder="e.g., BATCH-1694567890123"
                  className="pl-10 form-input"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !batchId.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Track Batch
                  </>
                )}
              </button>
              {(harvestData || error) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          {/* Sample Batch IDs */}
          <div className="text-sm text-gray-500">
            <p className="mb-1">Don't have a batch ID? Try these sample IDs:</p>
            <div className="flex flex-wrap gap-2">
              {['BATCH-1694567890123', 'BATCH-1694567890456', 'BATCH-1694567890789'].map((sampleId) => (
                <button
                  key={sampleId}
                  type="button"
                  onClick={() => setBatchId(sampleId)}
                  className="text-primary-600 hover:text-primary-700 underline"
                  disabled={loading}
                >
                  {sampleId}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {harvestData && (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Batch Found!</span>
              <span className="ml-2">Here's your herb's complete journey.</span>
            </div>
          </div>

          {/* Herb Details */}
          <HerbDetails data={harvestData} />

          {/* Timeline and Map Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Timeline data={harvestData} />
            <HarvestMap data={harvestData} />
          </div>

          {/* Verification Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <div className="text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification Complete</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                This {harvestData.herbName} has been verified through our AI system with{' '}
                <span className="font-semibold">{harvestData.aiVerification?.confidence}% confidence</span>{' '}
                and has been geo-verified as originating from{' '}
                <span className="font-semibold">{harvestData.geoVerification?.state}, {harvestData.geoVerification?.country}</span>.
                You can trust the authenticity and traceability of this product.
              </p>
              
              {harvestData.geoVerification?.isWithinIndia && (
                <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verified Indian Origin
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!harvestData && !error && (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">How to Track Your Herb</h3>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</div>
              <p>Look for the batch ID on your product packaging or receipt</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</div>
              <p>Enter the batch ID in the search field above</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</div>
              <p>View the complete journey of your herb from farm to you</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumerPortalView;
