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

  // Inline styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      padding: '1rem',
      fontFamily: "'Inter', sans-serif"
    },
    maxWidth: {
      maxWidth: '32rem',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    logoContainer: {
      width: '5rem',
      height: '5rem',
      background: 'linear-gradient(135deg, #16a34a, #15803d)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      margin: '0 auto 1rem auto'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #16a34a, #15803d)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#16a34a',
      fontSize: '1.125rem',
      fontWeight: '500'
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '1rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '2rem',
      marginBottom: '1.5rem'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#166534',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '2px solid #bbf7d0',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    },
    inputFocus: {
      borderColor: '#22c55e',
      boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1)'
    },
    button: {
      width: '100%',
      padding: '1rem 2rem',
      borderRadius: '0.75rem',
      border: 'none',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #16a34a, #15803d)',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    },
    secondaryButton: {
      backgroundColor: 'white',
      color: '#16a34a',
      border: '2px solid #16a34a'
    },
    successButton: {
      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
      color: 'white'
    },
    uploadArea: {
      width: '100%',
      padding: '2rem',
      border: '2px dashed #22c55e',
      borderRadius: '1rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(240, 253, 244, 0.5)'
    },
    uploadAreaHover: {
      backgroundColor: 'rgba(220, 252, 231, 0.8)',
      borderColor: '#16a34a'
    },
    successMessage: {
      padding: '1.5rem',
      backgroundColor: 'rgba(240, 253, 244, 0.8)',
      border: '1px solid #bbf7d0',
      borderLeft: '4px solid #22c55e',
      borderRadius: '0.75rem',
      marginBottom: '1.5rem'
    },
    errorMessage: {
      padding: '1.5rem',
      backgroundColor: 'rgba(254, 242, 242, 0.8)',
      border: '1px solid #fecaca',
      borderLeft: '4px solid #ef4444',
      borderRadius: '0.75rem',
      marginBottom: '1.5rem'
    },
    errorText: {
      color: '#dc2626',
      fontSize: '0.875rem',
      marginTop: '0.25rem'
    },
    locationInfo: {
      marginTop: '0.5rem',
      padding: '0.75rem',
      backgroundColor: 'rgba(240, 253, 244, 0.8)',
      borderRadius: '0.5rem'
    },
    infoFooter: {
      textAlign: 'center',
      marginTop: '1.5rem'
    },
    infoCard: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }
  };

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
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <Leaf size={40} color="white" />
          </div>
          <h1 style={styles.title}>Farmer Portal</h1>
          <p style={styles.subtitle}>Submit your herb harvest data</p>
        </div>

        {/* Success/Error Messages */}
        {submitResult && (
          <div style={submitResult.success ? styles.successMessage : styles.errorMessage}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              {submitResult.success ? (
                <CheckCircle size={24} color="#22c55e" style={{ marginRight: '0.5rem' }} />
              ) : (
                <XCircle size={24} color="#dc2626" style={{ marginRight: '0.5rem' }} />
              )}
              <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', color: submitResult.success ? '#166534' : '#dc2626' }}>
                {submitResult.success ? '🎉 Success!' : '⚠️ Error'}
              </h3>
            </div>
            <p style={{ color: submitResult.success ? '#166534' : '#dc2626', marginBottom: '1rem' }}>
              {submitResult.message}
            </p>
            
            {submitResult.success && submitResult.data && (
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '0.75rem', 
                padding: '1rem', 
                border: '1px solid #bbf7d0' 
              }}>
                <p style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '1.125rem', 
                  fontWeight: 'bold', 
                  color: '#16a34a', 
                  marginBottom: '0.5rem' 
                }}>
                  Batch ID: {submitResult.data.batchId}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#166534' }}>AI Verification:</span>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    backgroundColor: '#dcfce7', 
                    color: '#166534', 
                    borderRadius: '9999px', 
                    fontSize: '0.875rem', 
                    fontWeight: 'bold' 
                  }}>
                    {submitResult.data.aiVerification?.confidence}% Confidence
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#16a34a' }}>
                  📍 Location: {submitResult.data.geoVerification?.state}, {submitResult.data.geoVerification?.country}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <div style={styles.card}>
          <form onSubmit={handleSubmit}>
            {/* Farmer Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <User size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Farmer Name *
              </label>
              <input
                type="text"
                name="farmerName"
                value={formData.farmerName}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  borderColor: errors.farmerName ? '#dc2626' : '#bbf7d0'
                }}
                placeholder="Enter your full name"
              />
              {errors.farmerName && (
                <p style={styles.errorText}>{errors.farmerName}</p>
              )}
            </div>

            {/* Herb Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Leaf size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Herb Name *
              </label>
              <select
                name="herbName"
                value={formData.herbName}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  borderColor: errors.herbName ? '#dc2626' : '#bbf7d0'
                }}
              >
                <option value="">🌿 Select an herb</option>
                {AYURVEDIC_HERBS.map((herb) => (
                  <option key={herb} value={herb}>{herb}</option>
                ))}
              </select>
              {errors.herbName && (
                <p style={styles.errorText}>{errors.herbName}</p>
              )}
            </div>

            {/* Quantity */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                ⚖️ Quantity (kg) *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  borderColor: errors.quantity ? '#dc2626' : '#bbf7d0'
                }}
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
              {errors.quantity && (
                <p style={styles.errorText}>{errors.quantity}</p>
              )}
            </div>

            {/* Location */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <MapPin size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Location *
              </label>
              <button
                type="button"
                onClick={handleCaptureLocation}
                disabled={loading.location}
                style={{
                  ...styles.button,
                  ...(location ? styles.successButton : styles.secondaryButton)
                }}
              >
                {loading.location ? (
                  <>
                    <Loader size={20} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                    Getting Location...
                  </>
                ) : location ? (
                  <>
                    <CheckCircle size={20} style={{ marginRight: '0.5rem' }} />
                    ✅ Location Captured
                  </>
                ) : (
                  <>
                    <MapPin size={20} style={{ marginRight: '0.5rem' }} />
                    🌍 Capture Location
                  </>
                )}
              </button>
              
              {location && (
                <div style={styles.locationInfo}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#166534' }}>📍 Coordinates</p>
                  <p style={{ fontSize: '0.75rem', color: '#16a34a', fontFamily: 'monospace' }}>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                </div>
              )}
              
              {errors.location && (
                <p style={styles.errorText}>{errors.location}</p>
              )}
            </div>

            {/* Image Upload */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Camera size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Herb Image *
              </label>
              <label style={{
                ...styles.uploadArea,
                backgroundColor: uploadedImage ? 'rgba(240, 253, 244, 0.8)' : 'rgba(249, 250, 251, 0.8)'
              }}>
                {loading.image ? (
                  <div>
                    <Loader size={32} style={{ margin: '0 auto', animation: 'spin 1s linear infinite', color: '#22c55e' }} />
                    <p style={{ marginTop: '0.5rem', color: '#16a34a', fontWeight: '600' }}>📷 Uploading...</p>
                  </div>
                ) : uploadedImage ? (
                  <div>
                    <CheckCircle size={32} style={{ margin: '0 auto', color: '#22c55e' }} />
                    <p style={{ marginTop: '0.5rem', color: '#166534', fontWeight: 'bold' }}>✅ {uploadedImage.name}</p>
                    <p style={{ color: '#16a34a', fontSize: '0.875rem' }}>{(uploadedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <Camera size={32} style={{ margin: '0 auto', color: '#16a34a' }} />
                    <p style={{ marginTop: '0.5rem', color: '#166534', fontWeight: '600' }}>📸 Click to upload</p>
                    <p style={{ color: '#16a34a', fontSize: '0.875rem' }}>PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={loading.image}
                />
              </label>
              
              {errors.imageUrl && (
                <p style={styles.errorText}>{errors.imageUrl}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading.submit}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                fontSize: '1.25rem',
                fontWeight: 'bold',
                opacity: loading.submit ? 0.6 : 1,
                cursor: loading.submit ? 'not-allowed' : 'pointer'
              }}
            >
              {loading.submit ? (
                <>
                  <Loader size={24} style={{ marginRight: '0.75rem', animation: 'spin 1s linear infinite' }} />
                  🔄 Processing...
                </>
              ) : (
                <>
                  <Upload size={24} style={{ marginRight: '0.75rem' }} />
                  🌱 Submit Harvest
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Footer */}
        <div style={styles.infoFooter}>
          <div style={styles.infoCard}>
            <p style={{ color: '#16a34a', fontWeight: '600' }}>
              🤖 Your harvest data will be verified using AI and geo-validation
            </p>
            <p style={{ color: '#16a34a', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              🔒 Secure • 🌍 Traceable • ✅ Verified
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FarmerView;
