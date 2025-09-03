import React, { useState } from 'react';
import { MapPin, Camera, Upload, Loader, CheckCircle, XCircle, Leaf, User } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
            <Leaf className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
            Farmer Portal
          </h1>
          <p className="text-green-600 text-lg font-medium">Submit your herb harvest data</p>
        </div>

        {/* Success/Error Messages */}
        {submitResult && (
          <div className={`mb-6 p-6 rounded-2xl border-l-4 ${
            submitResult.success 
              ? 'bg-green-50 border-l-green-500 text-green-800'
              : 'bg-red-50 border-l-red-500 text-red-800'
          }`}>
            <div className="flex items-center mb-4">
              {submitResult.success ? (
                <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 mr-2 text-red-600" />
              )}
              <h3 className="font-bold text-lg">
                {submitResult.success ? '🎉 Success!' : '⚠️ Error'}
              </h3>
            </div>
            <p className="mb-4">{submitResult.message}</p>
            
            {submitResult.success && submitResult.data && (
              <div className="bg-white rounded-xl p-4 border">
                <p className="font-mono text-lg font-bold text-green-600 mb-2">
                  Batch ID: {submitResult.data.batchId}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Verification:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                    {submitResult.data.aiVerification?.confidence}% Confidence
                  </span>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  📍 Location: {submitResult.data.geoVerification?.state}, {submitResult.data.geoVerification?.country}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Farmer Name */}
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Farmer Name *
              </label>
              <input
                type="text"
                name="farmerName"
                value={formData.farmerName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your full name"
              />
              {errors.farmerName && (
                <p className="text-red-500 text-sm mt-1">{errors.farmerName}</p>
              )}
            </div>

            {/* Herb Name */}
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-2">
                <Leaf className="inline h-4 w-4 mr-1" />
                Herb Name *
              </label>
              <select
                name="herbName"
                value={formData.herbName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">🌿 Select an herb</option>
                {AYURVEDIC_HERBS.map((herb) => (
                  <option key={herb} value={herb}>{herb}</option>
                ))}
              </select>
              {errors.herbName && (
                <p className="text-red-500 text-sm mt-1">{errors.herbName}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-2">
                ⚖️ Quantity (kg) *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location *
              </label>
              <button
                type="button"
                onClick={handleCaptureLocation}
                disabled={loading.location}
                className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  location 
                    ? 'bg-green-500 text-white'
                    : 'bg-white border-2 border-green-300 text-green-700 hover:bg-green-50'
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
                    ✅ Location Captured
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5 mr-2" />
                    🌍 Capture Location
                  </>
                )}
              </button>
              
              {location && (
                <div className="mt-2 p-3 bg-green-50 rounded-xl">
                  <p className="text-sm font-semibold text-green-800">📍 Coordinates</p>
                  <p className="text-xs text-green-600 font-mono">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                </div>
              )}
              
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-2">
                <Camera className="inline h-4 w-4 mr-1" />
                Herb Image *
              </label>
              <label className={`w-full flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                uploadedImage 
                  ? 'bg-green-50 border-green-400'
                  : 'bg-gray-50 border-green-300 hover:bg-green-50'
              }`}>
                {loading.image ? (
                  <div className="text-center">
                    <Loader className="h-8 w-8 text-green-500 animate-spin mx-auto" />
                    <p className="mt-2 text-green-700 font-semibold">📷 Uploading...</p>
                  </div>
                ) : uploadedImage ? (
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="mt-2 text-green-800 font-bold">✅ {uploadedImage.name}</p>
                    <p className="text-green-600 text-sm">{(uploadedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="h-8 w-8 text-green-600 mx-auto" />
                    <p className="mt-2 text-green-800 font-semibold">📸 Click to upload</p>
                    <p className="text-green-600 text-sm">PNG, JPG, WEBP up to 5MB</p>
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
              
              {errors.imageUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading.submit}
              className={`w-full py-4 px-8 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 ${
                loading.submit
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg'
              }`}
            >
              {loading.submit ? (
                <>
                  <Loader className="inline h-6 w-6 mr-3 animate-spin" />
                  🔄 Processing...
                </>
              ) : (
                <>
                  <Upload className="inline h-6 w-6 mr-3" />
                  🌱 Submit Harvest
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-green-700 font-semibold">
              🤖 Your harvest data will be verified using AI and geo-validation
            </p>
            <p className="text-green-600 text-sm mt-2">
              🔒 Secure • 🌍 Traceable • ✅ Verified
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerView;
