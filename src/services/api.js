import axios from 'axios';

// ======================
// API CONFIGURATION
// ======================
const BASE_URL = 'https://reporteasy-api.onrender.com/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ======================
// REQUEST INTERCEPTOR
// ======================
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Must be exactly this format
  }
  return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================
// RESPONSE INTERCEPTOR
// ======================
apiClient.interceptors.response.use(
  (response) => {
    // Transform successful responses
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Auto-logout on 401 Unauthorized
      if (status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      const errorPayload = {
        status,
        message: data?.error || data?.message || 'An error occurred',
        details: data?.details || null,
        retryAfter: data?.retryAfter || null,
        code: data?.code || null,
      };

      console.error(`API Error ${status}:`, errorPayload.message);
      return Promise.reject(errorPayload);
    }

    if (error.request) {
      // The request was made but no response received
      const networkError = {
        status: 0,
        message: 'Network error - please check your connection',
        details: error.message,
      };
      console.error('Network Error:', networkError.message);
      return Promise.reject(networkError);
    }

    // Something happened in setting up the request
    console.error('Request Error:', error.message);
    return Promise.reject({
      status: 0,
      message: error.message,
      details: null,
    });
  }
);

// ======================
// API METHODS
// ======================
const api = {
  // ======================
  // AUTHENTICATION
  // ======================
  auth: {
    login: async (credentials) => {
      try {
        const response = await apiClient.post('/admin/login', {
          email: credentials.email || 'movineee@gmail.com',
          password: credentials.password || 'ocholamo1',
        });
        localStorage.setItem('token', response.token);
        return response;
      } catch (error) {
        console.error('Login Error:', error.message);
        throw error;
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    },

    validateToken: async () => {
      try {
        // You might want to create a token validation endpoint
        await apiClient.get('/dashboard');
        return true;
      } catch (error) {
        return false;
      }
    },
  },

  // ======================
  // DASHBOARD
  // ======================
  dashboard: {
    getOverview: async () => {
      return await apiClient.get('/dashboard');
    },
  },

  // ======================
  // REPORTS
  // ======================
  reports: {
    list: async (params = {}) => {
      return await apiClient.get('/reports', { 
        params: {
          limit: 50,
          offset: 0,
          ...params
        } 
      });
    },

    get: async (id) => {
      return await apiClient.get(`/reports/${id}`);
    },

    updateStatus: async (id, status, notes = '') => {
      return await apiClient.put(`/reports/${id}`, { status, notes });
    },

    getStats: async () => {
      return await apiClient.get('/reports/stats');
    },

    sendMultiChannelUpdate: async (id, message) => {
      return await apiClient.post(`/reports/${id}/multi-channel-update`, { 
        status: 'in-progress',
        message 
      });
    },
  },

  // ======================
  // ANALYTICS
  // ======================
  analytics: {
    getInsights: async () => {
      return await apiClient.get('/analytics/insights');
    },

    getLeaderboard: async (limit = 10) => {
      return await apiClient.get('/analytics/leaderboard', { 
        params: { limit } 
      });
    },

    getCommunityImpact: async () => {
      return await apiClient.get('/analytics/community-impact');
    },

    getHotspots: async () => {
      return await apiClient.get('/analytics/hotspots');
    },
  },

  // ======================
  // INTEGRATIONS
  // ======================
  integrations: {
    handleTwilioWebhook: async (data) => {
      return await apiClient.post('/twilio', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    },

    verifyWebhook: async (params) => {
      return await apiClient.get('/webhook', { params });
    },
  },
};

// ======================
// UTILITY FUNCTIONS
// ======================
export const buildReportFilters = (filters = {}) => {
  const validFilters = {};
  const validFields = [
    'status', 'category', 'priority', 'location', 
    'startDate', 'endDate', 'messageType'
  ];

  validFields.forEach(field => {
    if (filters[field]) validFilters[field] = filters[field];
  });

  return {
    limit: filters.limit || 50,
    offset: filters.offset || 0,
    ...validFilters
  };
};

export const isAuthError = (error) => {
  return error?.status === 401;
};

export const isNetworkError = (error) => {
  return error?.status === 0;
};

export const isRateLimitError = (error) => {
  return error?.status === 429;
};

export default api;