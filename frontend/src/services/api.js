import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API endpoints
export const apiService = {
  // Submit harvest data
  submitHarvest: async (harvestData) => {
    const response = await api.post('/collection-events', harvestData);
    return response.data;
  },

  // Get all collection events with pagination and filters
  getCollectionEvents: async (params = {}) => {
    const response = await api.get('/collection-events', { params });
    return response.data;
  },

  // Get collection event by batch ID
  getCollectionEventByBatchId: async (batchId) => {
    const response = await api.get(`/collection-events/${batchId}`);
    return response.data;
  },

  // Get collection events statistics
  getCollectionEventsStats: async () => {
    const response = await api.get('/collection-events/stats');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
