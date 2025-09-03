// Get user's current location using browser geolocation API
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred while retrieving location';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

// Format date to readable string
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  }).format(new Date(date));
};

// Format location coordinates
export const formatCoordinates = (lat, lng) => {
  return `${lat?.toFixed(6) || 'N/A'}, ${lng?.toFixed(6) || 'N/A'}`;
};

// Common Ayurvedic herbs list
export const AYURVEDIC_HERBS = [
  'Ashwagandha',
  'Turmeric',
  'Tulsi',
  'Brahmi',
  'Neem',
  'Amla',
  'Giloy',
  'Shatavari',
  'Arjuna',
  'Triphala',
  'Gokshura',
  'Manjistha',
  'Guduchi',
  'Bala',
  'Vidanga',
  'Shankhpushpi',
  'Jatamansi',
  'Bhringraj',
  'Methi',
  'Ajwain'
];

// Simulate image upload (for demo purposes)
export const simulateImageUpload = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      reject(new Error('Invalid file type. Please upload a valid image file.'));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      reject(new Error('File size too large. Maximum size allowed is 5MB.'));
      return;
    }

    // Simulate upload delay
    setTimeout(() => {
      // In a real app, this would upload to a cloud service
      // For demo, we'll create a mock URL
      const mockUrl = `https://example.com/uploads/${Date.now()}-${file.name}`;
      resolve({
        url: mockUrl,
        name: file.name,
        size: file.size,
        type: file.type
      });
    }, 1500); // 1.5 second delay to simulate upload
  });
};

// Get confidence level color
export const getConfidenceColor = (confidence) => {
  if (confidence >= 95) return 'text-green-600';
  if (confidence >= 85) return 'text-yellow-600';
  return 'text-red-600';
};

// Get confidence level badge
export const getConfidenceBadge = (confidence) => {
  if (confidence >= 95) return { color: 'bg-green-100 text-green-800', label: 'High Confidence' };
  if (confidence >= 85) return { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Confidence' };
  return { color: 'bg-red-100 text-red-800', label: 'Low Confidence' };
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
