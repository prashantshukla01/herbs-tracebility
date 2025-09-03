/**
 * Utility functions for geographic verification
 */

/**
 * Check if coordinates are within India's boundaries
 * India's approximate boundaries:
 * Latitude: 8.4° to 37.6° N
 * Longitude: 68.7° to 97.25° E
 * 
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {object} Object with isWithinIndia boolean and state information
 */
const checkIndianCoordinates = (latitude, longitude) => {
  const isWithinIndia = (
    latitude >= 8.4 && latitude <= 37.6 &&
    longitude >= 68.7 && longitude <= 97.25
  );

  let state = 'Unknown';
  
  // Simple state detection based on coordinate ranges
  // This is a simplified version - in production, you'd use a proper geocoding service
  if (isWithinIndia) {
    if (latitude >= 28.0 && latitude <= 30.5 && longitude >= 76.8 && longitude <= 78.5) {
      state = 'Delhi/Haryana';
    } else if (latitude >= 26.0 && latitude <= 30.5 && longitude >= 70.0 && longitude <= 78.0) {
      state = 'Rajasthan';
    } else if (latitude >= 21.0 && latitude <= 26.0 && longitude >= 68.0 && longitude <= 74.5) {
      state = 'Gujarat';
    } else if (latitude >= 15.0 && latitude <= 21.0 && longitude >= 73.0 && longitude <= 80.5) {
      state = 'Maharashtra';
    } else if (latitude >= 11.0 && latitude <= 18.5 && longitude >= 74.0 && longitude <= 81.5) {
      state = 'Karnataka/Andhra Pradesh';
    } else if (latitude >= 8.0 && latitude <= 13.0 && longitude >= 76.0 && longitude <= 80.5) {
      state = 'Tamil Nadu/Kerala';
    } else if (latitude >= 18.0 && latitude <= 25.0 && longitude >= 80.0 && longitude <= 87.5) {
      state = 'Odisha/Chhattisgarh';
    } else if (latitude >= 22.0 && latitude <= 27.5 && longitude >= 85.0 && longitude <= 89.5) {
      state = 'West Bengal/Jharkhand';
    } else if (latitude >= 24.0 && latitude <= 28.5 && longitude >= 80.0 && longitude <= 84.5) {
      state = 'Uttar Pradesh/Bihar';
    } else if (latitude >= 30.0 && latitude <= 37.6 && longitude >= 74.0 && longitude <= 80.0) {
      state = 'Himachal Pradesh/Uttarakhand';
    } else {
      state = 'India (Other State)';
    }
  }

  return {
    isWithinIndia,
    state,
    country: isWithinIndia ? 'India' : 'Outside India'
  };
};

/**
 * Simulate AI verification process
 * In production, this would call an actual AI service
 * 
 * @param {string} herbName 
 * @param {string} imageUrl 
 * @returns {Promise<object>} AI verification results
 */
const simulateAIVerification = async (herbName, imageUrl) => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate random confidence score between 90-98%
  const confidence = Math.floor(Math.random() * 9) + 90; // 90-98
  
  // List of common Ayurvedic herbs for simulation
  const ayurvedicHerbs = [
    'Ashwagandha', 'Turmeric', 'Tulsi', 'Brahmi', 'Neem', 
    'Amla', 'Giloy', 'Shatavari', 'Arjuna', 'Triphala',
    'Gokshura', 'Manjistha', 'Guduchi', 'Bala', 'Vidanga'
  ];
  
  // For simulation, either use the provided herb name or pick a random one
  let verifiedHerb = herbName;
  
  // 85% chance to verify the same herb, 15% chance to suggest a different one
  if (Math.random() < 0.15) {
    const randomHerb = ayurvedicHerbs[Math.floor(Math.random() * ayurvedicHerbs.length)];
    verifiedHerb = randomHerb;
  }
  
  return {
    confidence,
    verifiedHerb,
    processedImageUrl: imageUrl,
    verificationTimestamp: new Date().toISOString()
  };
};

module.exports = {
  checkIndianCoordinates,
  simulateAIVerification
};
