
import axios from 'axios';

// API base URL
const API_URL = 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication
export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    return response.data;
  },

  signOut: async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
  
  getSession: () => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    return {
      data: {
        session: token ? { user: JSON.parse(user || '{}') } : null
      }
    };
  },
  
  setupTestUser: async () => {
    return api.post('/auth/setup-test-user');
  }
};

// Data
export const data = {
  getResources: async () => {
    return api.get('/resources');
  },
  
  getMaps: async () => {
    return api.get('/maps');
  },
  
  getBookings: async () => {
    return api.get('/bookings');
  },
  
  getProfiles: async () => {
    return api.get('/profiles');
  },
  
  getTeams: async () => {
    return api.get('/teams');
  },
  
  // Add more data methods as needed...
};

// Export the API client
export default {
  auth,
  data
};
