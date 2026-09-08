/// <reference types="vite/client" />
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// To manage token refreshing gracefully and avoid race conditions
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Retry state tracker for network or timeout failures
interface CustomRequestConfig extends AxiosRequestConfig {
  _retryCount?: number;
}

// Request interceptor to attach JWT auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomRequestConfig;
    
    // Global Timeout / Network Failure Toasting and Handling
    if (error.code === 'ECONNABORTED' || !error.response) {
      const isGet = originalRequest.method?.toLowerCase() === 'get';
      const retryCount = originalRequest._retryCount || 0;
      
      if (isGet && retryCount < 3) {
        originalRequest._retryCount = retryCount + 1;
        const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 500;
        console.warn(`Network timeout/failure. Retrying GET request ${originalRequest.url} in ${Math.round(delay)}ms... (Attempt ${originalRequest._retryCount}/3)`);
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(originalRequest);
      }
      
      toast.error('Network Error', {
        description: 'Unable to connect to the server. Please check your internet connection or try again later.',
      });
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 401 Unauthorized handling (token expired or invalid)
    if (status === 401 && originalRequest && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const storedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
        const email = storedUser ? JSON.parse(storedUser).email : '';
        const refreshToken = localStorage.getItem('edupredict_refresh_token') || `mock_refresh_${Date.now()}`;
        
        // Execute real backend token refresh endpoint
        const refreshResponse = await axios.post(`${API_BASE_URL}api/auth/refresh`, {
          email,
          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = refreshResponse.data;
        
        localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
        if (newRefreshToken) {
          localStorage.setItem('edupredict_refresh_token', newRefreshToken);
        }

        processQueue(null, token);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Auto logout if refresh token expired / failed
        localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
        localStorage.removeItem('edupredict_refresh_token');

        if (window.location.pathname !== '/login') {
          window.location.href = '/login?session_expired=true';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      toast.error('Access Denied', {
        description: 'You do not have the required permissions to access this feature.',
      });
    }

    // Handle 500 Server Error
    if (status === 500) {
      toast.error('Internal Server Error', {
        description: 'The server encountered an issue processing your request. Our engineers are notified.',
      });
    }

    return Promise.reject(error);
  }
);

