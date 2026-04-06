// src/api/client.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.10.20.80:3001/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;
const DEFAULT_STORE_ID = parseInt(import.meta.env.VITE_DEFAULT_STORE_ID) || 6;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
});

// Token management functions
const tokenManager = {
  getAccessToken: () => {
    try {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.accessToken;
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }
    return null;
  },

  getRefreshToken: () => {
    try {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.refreshToken;
      }
    } catch (error) {
      console.error('Error getting refresh token:', error);
    }
    return null;
  },

  setAccessToken: (token) => {
    try {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        parsed.state.accessToken = token;
        localStorage.setItem('auth-storage', JSON.stringify(parsed));
      }
    } catch (error) {
      console.error('Error setting access token:', error);
    }
  },

  clearTokens: () => {
    localStorage.removeItem('auth-storage');
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add access token if available
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add language header
    const uiData = localStorage.getItem('ui-storage');
    if (uiData) {
      try {
        const parsed = JSON.parse(uiData);
        config.headers['Accept-Language'] = parsed.state?.language || 'ar';
      } catch (e) {
        config.headers['Accept-Language'] = 'ar';
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();

      // Only try to refresh if refresh token exists (rememberMe was true)
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken } = response.data.data;
          tokenManager.setAccessToken(accessToken);
          processQueue(null, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          isRefreshing = false;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          tokenManager.clearTokens();
          isRefreshing = false;
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available (user didn't check rememberMe)
        // Clear auth and redirect to login
        isRefreshing = false;
        processQueue(error, null);
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// API methods wrapper
export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
};

// Auth endpoints
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  
  // WebAuthn
  checkBiometricAvailability: (email) => 
    apiClient.get(`/auth/webauthn/check-availability?email=${email}`),
  getRegisterChallenge: () => 
    apiClient.get('/auth/webauthn/register-challenge'),
  verifyRegister: (data) => 
    apiClient.post('/auth/webauthn/register-verify', data),
  getLoginChallenge: (email) => 
    apiClient.get(`/auth/webauthn/login-challenge?email=${email}`),
  verifyLogin: (data) => 
    apiClient.post('/auth/webauthn/login-verify', data),
  listCredentials: () => 
    apiClient.get('/auth/webauthn/credentials'),
  deleteCredential: (id) => 
    apiClient.delete(`/auth/webauthn/credentials/${id}`),
};

// User endpoints
export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  changePassword: (data) => apiClient.put('/users/password', data),
};

// Pharmacy endpoints
export const pharmacyAPI = {
  getAvailable: () => apiClient.get('/pharmacies/available'),
  select: (pharmacyId) => apiClient.post('/pharmacies/select', { pharmacyId: String(pharmacyId) }),
  getCurrent: () => apiClient.get('/pharmacies/current'),
  getStatement: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/pharmacies/statement?${queryString}`);
  },
};

// Product endpoints
export const productAPI = {
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/products?${queryString}`);
  },
  getProductBySlug: (slug, store = DEFAULT_STORE_ID) =>
    apiClient.get(`/products/${slug}?store=${store}`),
  getCategories: (store = DEFAULT_STORE_ID) =>
    apiClient.get(`/categories?store=${store}`),
};

// Order endpoints
export const orderAPI = {
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/pharmacy/orders?${queryString}`);
  },
  getStatistics: () => apiClient.get('/pharmacy/orders/statistics'),
};

export default apiClient;