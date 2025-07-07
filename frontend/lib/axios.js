import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

// Rate limiting protection
let lastRefreshAttempt = 0;
const REFRESH_COOLDOWN = 5000; // 5 seconds cooldown between refresh attempts

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

const shouldAttemptRefresh = () => {
  const now = Date.now();
  if (now - lastRefreshAttempt < REFRESH_COOLDOWN) {
    console.log('Refresh attempt blocked due to cooldown');
    return false;
  }
  return true;
};

// Intercept responses to handle token refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is due to expired access token
    // IMPORTANT: Don't retry if the original request was already a refresh request
    if (
      (error.response?.status === 401 || error.response?.status === 403) && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh') && // Prevent refresh loop
      shouldAttemptRefresh() // Rate limiting protection
    ) {
      
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      lastRefreshAttempt = Date.now();

      try {
        // Attempt to refresh token
        await api.post('/api/auth/refresh');
        processQueue(null);
        // Retry the original request with the new access token
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error('Failed to refresh token:', refreshError.response?.status, refreshError.message);
        
        // Clear auth state if refresh fails
        if (typeof window !== 'undefined') {
          // Clear cookies
          document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          
          // Only redirect if it's not a rate limit error
          if (refreshError.response?.status !== 429) {
            // Dispatch custom event for auth failure instead of direct redirect
            window.dispatchEvent(new CustomEvent('auth-failure', { 
              detail: { error: refreshError, shouldRedirect: true } 
            }));
          }
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle rate limiting specifically
    if (error.response?.status === 429) {
      console.warn('Rate limited. Retrying after delay...');
      
      // If it's a refresh endpoint being rate limited, don't retry
      if (originalRequest.url?.includes('/api/auth/refresh')) {
        return Promise.reject(error);
      }
      
      // For other endpoints, implement exponential backoff
      const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount || 0), 10000);
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      if (originalRequest._retryCount <= 3) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;