import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('camdid_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 - Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('camdid_token');
      window.location.href = '/login';
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      error.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

export default api;