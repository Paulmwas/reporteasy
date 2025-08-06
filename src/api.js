import axios from 'axios';

// Base configuration
const BASE_URL = 'https://reporteasy-api.onrender.com/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token (when authentication is implemented)
apiClient.interceptors.request.use(
  (config) => {
    // For now, we'll bypass authentication
    // Later: const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('Authentication required');
          // Later: handle logout/redirect to login
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 429:
          console.error('Rate limit exceeded');
          break;
        case 500:
          console.error('Internal server error');
          break;
        default:
          console.error(`API Error: ${status}`, data);
      }
      
      throw {
        status,
        message: data?.error || data?.message || 'An error occurred',
        details: data?.details || null,
        retryAfter: data?.retryAfter || null
      };
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
      throw {
        status: 0,
        message: 'Network error - please check your connection',
        details: error.message
      };
    } else {
      // Other error
      console.error('Request error:', error.message);
      throw {
        status: 0,
        message: error.message,
        details: null
      };
    }
  }
);

// API Methods
const api = {
  // ======================
  // DASHBOARD ENDPOINTS
  // ======================
  dashboard: {
    /**
     * Get real-time dashboard data
     */
    getDashboardData: async () => {
      try {
        const response = await apiClient.get('/dashboard');
        return response.data;
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
      }
    }
  },

  // ======================
  // REPORTS ENDPOINTS
  // ======================
  reports: {
    /**
     * Get all reports with filtering options
     */
    getAllReports: async (params = {}) => {
      try {
        const response = await apiClient.get('/reports', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }
    },

    /**
     * Get report by ID
     */
    getReportById: async (id) => {
      try {
        const response = await apiClient.get(`/reports/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching report ${id}:`, error);
        throw error;
      }
    },

    /**
     * Update report status
     */
    updateReportStatus: async (id, data) => {
      try {
        const response = await apiClient.put(`/reports/${id}`, data);
        return response.data;
      } catch (error) {
        console.error(`Error updating report ${id}:`, error);
        throw error;
      }
    },

    /**
     * Get report statistics
     */
    getReportStats: async () => {
      try {
        const response = await apiClient.get('/reports/stats');
        return response.data;
      } catch (error) {
        console.error('Error fetching report stats:', error);
        throw error;
      }
    },

    /**
     * Send multi-channel status update
     */
    sendMultiChannelUpdate: async (id, data) => {
      try {
        const response = await apiClient.post(`/reports/${id}/multi-channel-update`, data);
        return response.data;
      } catch (error) {
        console.error(`Error sending multi-channel update for report ${id}:`, error);
        throw error;
      }
    }
  },

  // ======================
  // ANALYTICS ENDPOINTS
  // ======================
  analytics: {
    /**
     * Get predictive analytics insights
     */
    getInsights: async () => {
      try {
        const response = await apiClient.get('/analytics/insights');
        return response.data;
      } catch (error) {
        console.error('Error fetching analytics insights:', error);
        throw error;
      }
    },

    /**
     * Get citizen engagement leaderboard
     */
    getLeaderboard: async (limit = 10) => {
      try {
        const response = await apiClient.get('/analytics/leaderboard', {
          params: { limit }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
      }
    },

    /**
     * Get community impact statistics
     */
    getCommunityImpact: async () => {
      try {
        const response = await apiClient.get('/analytics/community-impact');
        return response.data;
      } catch (error) {
        console.error('Error fetching community impact:', error);
        throw error;
      }
    },

    /**
     * Get incident hotspots with coordinates
     */
    getHotspots: async () => {
      try {
        const response = await apiClient.get('/analytics/hotspots');
        return response.data;
      } catch (error) {
        console.error('Error fetching hotspots:', error);
        throw error;
      }
    }
  },

  // ======================
  // AUTHENTICATION ENDPOINTS
  // ======================
  auth: {
    /**
     * Admin login
     */
    login: async (credentials) => {
      try {
        const response = await apiClient.post('/admin/login', credentials);
        // Store token when authentication is implemented
        // localStorage.setItem('authToken', response.data.token);
        return response.data;
      } catch (error) {
        console.error('Error during login:', error);
        throw error;
      }
    },

    /**
     * Logout (client-side for now)
     */
    logout: () => {
      // localStorage.removeItem('authToken');
      console.log('User logged out');
    }
  },

  // ======================
  // WEBHOOK ENDPOINTS
  // ======================
  webhook: {
    /**
     * Verify WhatsApp webhook
     */
    verifyWebhook: async (params) => {
      try {
        const response = await apiClient.get('/webhook', { params });
        return response.data;
      } catch (error) {
        console.error('Error verifying webhook:', error);
        throw error;
      }
    },

    /**
     * Handle incoming WhatsApp messages
     */
    handleWebhook: async (payload) => {
      try {
        const response = await apiClient.post('/webhook', payload);
        return response.data;
      } catch (error) {
        console.error('Error handling webhook:', error);
        throw error;
      }
    }
  },

  // ======================
  // TWILIO INTEGRATION
  // ======================
  twilio: {
    /**
     * Handle Twilio WhatsApp webhook
     */
    handleTwilioWebhook: async (data) => {
      try {
        const response = await apiClient.post('/twilio', data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error handling Twilio webhook:', error);
        throw error;
      }
    }
  }
};

// ======================
// UTILITY FUNCTIONS
// ======================

/**
 * Build query parameters for reports filtering
 */
export const buildReportsParams = ({
  status,
  category,
  priority,
  location,
  startDate,
  endDate,
  messageType,
  limit = 50,
  offset = 0
} = {}) => {
  const params = { limit, offset };
  
  if (status) params.status = status;
  if (category) params.category = category;
  if (priority) params.priority = priority;
  if (location) params.location = location;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (messageType) params.messageType = messageType;
  
  return params;
};

/**
 * Format error for display
 */
export const formatError = (error) => {
  return {
    status: error.status || 0,
    message: error.message || 'An unexpected error occurred',
    details: error.details || null,
    retryAfter: error.retryAfter || null
  };
};

/**
 * Check if error is rate limit error
 */
export const isRateLimitError = (error) => {
  return error.status === 429;
};

/**
 * Check if error is network error
 */
export const isNetworkError = (error) => {
  return error.status === 0;
};

// Export the main API object
export default api;

// Export axios instance for custom requests if needed
export { apiClient };