import React, { useState } from 'react';
import { MapPin, Camera, Upload, Loader, CheckCircle, XCircle, Leaf } from 'lucide-react';
import { apiService } from '../services/api';
import { getCurrentLocation, simulateImageUpload, AYURVEDIC_HERBS, getConfidenceBadge } from '../utils/helpers';

const FarmerView = () => {
  const [formData, setFormData] = useState({
    farmerName: '',
    herbName: '',
    quantity: '',
    latitude: null,
    longitude: null,
    imageUrl: ''
  });
  
  const [loading, setLoading] = useState({
    location: false,
    image: false,
    submit: false
  });
  
  const [uploadedImage, setUploadedImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Capture current location
  const handleCaptureLocation = async () => {
    setLoading(prev => ({ ...prev, location: true }));
    
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
      setFormData(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude
      }));
      
      if (errors.location) {
        setErrors(prev => ({ ...prev, location: null }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        location: error.message
      }));
    } finally {
      setLoading(prev => ({ ...prev, location: false }));
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(prev => ({ ...prev, image: true }));
    
    try {
      const uploadResult = await simulateImageUpload(file);
      setUploadedImage(uploadResult);
      setFormData(prev => ({
        ...prev,
        imageUrl: uploadResult.url
      }));
      
      if (errors.imageUrl) {
        setErrors(prev => ({ ...prev, imageUrl: null }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        imageUrl: error.message
      }));
    } finally {
      setLoading(prev => ({ ...prev, image: false }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.farmerName.trim()) {
      newErrors.farmerName = 'Farmer name is required';
    }
    
    if (!formData.herbName) {
      newErrors.herbName = 'Please select an herb';
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }
    
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.imageUrl) {
      newErrors.imageUrl = 'Image upload is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(prev => ({ ...prev, submit: true }));
    setSubmitResult(null);
    
    try {
      const result = await apiService.submitHarvest(formData);
      setSubmitResult({
        success: true,
        data: result.data,
        message: result.message
      });
      
      // Reset form
      setFormData({
        farmerName: '',
        herbName: '',
        quantity: '',
        latitude: null,
        longitude: null,
        imageUrl: ''
      });
      setUploadedImage(null);
      setLocation(null);
      
    } catch (error) {
      setSubmitResult({
        success: false,
        message: error.response?.data?.message || 'Failed to submit harvest data'
      });
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 mobile-container">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Farmer Portal</h1>
          <p className="text-gray-600 mt-1">Submit your herb harvest data</p>
        </div>

        {/* Success/Error Messages */}
        {submitResult && (
          <div className={`mb-6 p-4 rounded-lg ${
            submitResult.success 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <div className="flex items-center">
              {submitResult.success ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 mr-2" />
              )}
              <span className="font-medium">{submitResult.message}</span>
            </div>
            
            {submitResult.success && submitResult.data && (
              <div className="mt-3 p-3 bg-white rounded border">
                <p className="text-sm font-medium text-gray-900">
                  Batch ID: {submitResult.data.batchId}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Verification:</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    getConfidenceBadge(submitResult.data.aiVerification?.confidence).color
                  }`}>
                    {submitResult.data.aiVerification?.confidence}% Confidence
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Location: {submitResult.data.geoVerification?.state}, {submitResult.data.geoVerification?.country}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Farmer Name */}
          <div>
            <label className="form-label">
              Farmer Name *
            </label>
            <input
              type="text"
              name="farmerName"
              value={formData.farmerName}
              onChange={handleInputChange}
              className={`form-input ${errors.farmerName ? 'border-red-500' : ''}`}
              placeholder="Enter your full name"
            />
            {errors.farmerName && (
              <p className="text-red-500 text-sm mt-1">{errors.farmerName}</p>
            )}
          </div>

          {/* Herb Name */}
          <div>
            <label className="form-label">
              Herb Name *
            </label>
            <select
              name="herbName"
              value={formData.herbName}
              onChange={handleInputChange}
              className={`form-input ${errors.herbName ? 'border-red-500' : ''}`}
            >
              <option value="">Select an herb</option>
              {AYURVEDIC_HERBS.map((herb) => (
                <option key={herb} value={herb}>
                  {herb}
                </option>
              ))}
            </select>
            {errors.herbName && (
              <p className="text-red-500 text-sm mt-1">{errors.herbName}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="form-label">
              Quantity (kg) *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className={`form-input ${errors.quantity ? 'border-red-500' : ''}`}
              placeholder="Enter quantity in kg"
              min="0.01"
              step="0.01"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          {/* Location Capture */}
          <div>
            <label className="form-label">
              Location *
            </label>
            <button
              type="button"
              onClick={handleCaptureLocation}
              disabled={loading.location}
              className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg font-medium transition-colors ${
                location 
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {loading.location ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Getting Location...
                </>
              ) : location ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Location Captured
                </>
              ) : (
                <>
                  <MapPin className="h-5 w-5 mr-2" />
                  Capture Current Location
                </>
              )}
            </button>
            
            {location && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-600">
                Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                {location.accuracy && (
                  <span className="block">Accuracy: ±{Math.round(location.accuracy)}m</span>
                )}
              </div>
            )}
            
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="form-label">
              Herb Image *
            </label>
            <div className="mt-1">
              <label className={`w-full flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                uploadedImage 
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
              }`}>
                {loading.image ? (
                  <div className="text-center">
                    <Loader className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Uploading image...</p>
                  </div>
                ) : uploadedImage ? (
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="mt-2 text-sm text-green-700 font-medium">
                      {uploadedImage.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading.image}
                />
              </label>
            </div>
            
            {errors.imageUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading.submit}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
              loading.submit
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
            }`}
          >
            {loading.submit ? (
              <>
                <Loader className="inline h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="inline h-5 w-5 mr-2" />
                Submit Harvest
              </>
            )}
          </button>
        </form>

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Your harvest data will be verified using AI and geo-validation</p>
        </div>
      </div>
    </div>
  );
};

export default FarmerView;
