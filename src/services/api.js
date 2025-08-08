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
  // COMMUNITY SOLUTIONS
  // ======================
  solutions: {
    // Submit a solution proposal for a report
    submitSolution: async (reportId, solutionData) => {
      try {
        const response = await apiClient.post(`/solutions/reports/${reportId}/solutions`, {
          providerId: solutionData.providerId,
          solutionType: solutionData.solutionType || 'volunteer', // volunteer, paid, expert
          description: solutionData.description,
          estimatedCost: solutionData.estimatedCost || null,
          estimatedTime: solutionData.estimatedTime,
          expertise: solutionData.expertise,
          paymentOffered: solutionData.paymentOffered || null,
        });
        return response;
      } catch (error) {
        console.error('Submit Solution Error:', error.message);
        throw error;
      }
    },

    // Get all solutions for a specific report
    getReportSolutions: async (reportId) => {
      try {
        return await apiClient.get(`/solutions/reports/${reportId}/solutions`);
      } catch (error) {
        console.error('Get Report Solutions Error:', error.message);
        throw error;
      }
    },

    // Accept a solution proposal (Admin only)
    acceptSolution: async (solutionId, paymentOffered = null) => {
      try {
        const payload = {};
        if (paymentOffered) {
          payload.paymentOffered = paymentOffered;
        }
        return await apiClient.post(`/solutions/${solutionId}/accept`, payload);
      } catch (error) {
        console.error('Accept Solution Error:', error.message);
        throw error;
      }
    },

    // Complete a solution and provide rating (Admin only)
    completeSolution: async (solutionId, rating) => {
      try {
        return await apiClient.post(`/solutions/${solutionId}/complete`, {
          rating: rating, // 1-5 stars
        });
      } catch (error) {
        console.error('Complete Solution Error:', error.message);
        throw error;
      }
    },

    // Get top community providers
    getTopProviders: async (limit = 10) => {
      try {
        return await apiClient.get('/solutions/providers/top', {
          params: { limit }
        });
      } catch (error) {
        console.error('Get Top Providers Error:', error.message);
        throw error;
      }
    },

    // Register as a community provider
    registerProvider: async (providerData) => {
      try {
        return await apiClient.post('/solutions/providers/register', {
          phoneNumber: providerData.phoneNumber,
          name: providerData.name,
          expertise: providerData.expertise, // Array of skills
        });
      } catch (error) {
        console.error('Register Provider Error:', error.message);
        // Handle the 404 error from your API (endpoint might not be implemented yet)
        if (error.status === 404) {
          throw {
            ...error,
            message: 'Provider registration endpoint is not available yet. Please contact admin.',
          };
        }
        throw error;
      }
    },

    // Get detailed solutions for a report (Admin view)
    getReportSolutionsAdmin: async (reportId) => {
      try {
        return await apiClient.get(`/solutions/report/${reportId}`);
      } catch (error) {
        console.error('Get Report Solutions Admin Error:', error.message);
        throw error;
      }
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

// Solution-specific utility functions
export const buildSolutionPayload = (solutionData) => {
  const requiredFields = ['providerId', 'description', 'estimatedTime', 'expertise'];
  const missingFields = requiredFields.filter(field => !solutionData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  return {
    providerId: solutionData.providerId,
    solutionType: solutionData.solutionType || 'volunteer',
    description: solutionData.description.trim(),
    estimatedCost: solutionData.solutionType === 'paid' ? solutionData.estimatedCost : null,
    estimatedTime: solutionData.estimatedTime.trim(),
    expertise: solutionData.expertise.trim(),
    paymentOffered: solutionData.paymentOffered || null,
  };
};

export const validateRating = (rating) => {
  const numRating = parseInt(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    throw new Error('Rating must be a number between 1 and 5');
  }
  return numRating;
};

export const validatePhoneNumber = (phoneNumber) => {
  const kenyanPhoneRegex = /^\+254[17]\d{8}$/;
  if (!kenyanPhoneRegex.test(phoneNumber)) {
    throw new Error('Invalid Kenyan phone number format. Use +254XXXXXXXXX');
  }
  return phoneNumber;
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

export const isSolutionError = (error) => {
  return error?.code && error.code.includes('SOLUTION');
};

export const getSolutionStatusColor = (status) => {
  const statusColors = {
    pending: 'yellow',
    accepted: 'blue',
    in_progress: 'orange',
    completed: 'green',
    rejected: 'red',
  };
  return statusColors[status] || 'gray';
};

export const getSolutionTypeIcon = (type) => {
  const typeIcons = {
    volunteer: '🤝',
    paid: '💰',
    expert: '👨‍🔬',
  };
  return typeIcons[type] || '❓';
};

export default api;