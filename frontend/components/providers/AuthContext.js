"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import Cookies from 'js-cookie';

const AuthContext = createContext(undefined);

// Singleton request manager to prevent duplicate requests
const requestManager = {
  pendingRequests: new Map(),
  lastAuthCheck: 0,
  AUTH_CHECK_COOLDOWN: 8000, // 8 seconds cooldown

  async executeRequest(key, requestFn) {
    // If we already have a pending request for this key, return it
    if (this.pendingRequests.has(key)) {
      console.log(`🔄 Reusing pending ${key} request`);
      return this.pendingRequests.get(key);
    }

    // Create new request
    const promise = requestFn()
      .finally(() => {
        // Remove from pending requests when done
        this.pendingRequests.delete(key);
      });

    // Store the promise
    this.pendingRequests.set(key, promise);
    return promise;
  },

  shouldCheckAuth(force = false) {
    if (force) return true;
    
    const now = Date.now();
    if (now - this.lastAuthCheck < this.AUTH_CHECK_COOLDOWN) {
      const remaining = Math.ceil((this.AUTH_CHECK_COOLDOWN - (now - this.lastAuthCheck)) / 1000);
      console.log(`⏳ Auth check blocked (${remaining}s remaining)`);
      return false;
    }
    
    this.lastAuthCheck = now;
    return true;
  },

  clearAll() {
    this.pendingRequests.clear();
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const mountedRef = useRef(true);

  const clearAuthCookies = useCallback(() => {
    const cookieOptions = [
      { path: '/' },
      { path: '/', domain: 'localhost' },
      { path: '/', domain: window.location.hostname }
    ];

    cookieOptions.forEach(options => {
      try {
        Cookies.remove('accessToken', options);
        Cookies.remove('refreshToken', options);
      } catch (error) {
        // Ignore errors
      }
    });

    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }, []);

  const resetAuthState = useCallback(() => {
    if (!mountedRef.current) return;
    
    setUser(null);
    setIsAuthenticated(false);
    clearAuthCookies();
  }, [clearAuthCookies]); // Dependency: clearAuthCookies

  // Memoized auth check function
  const checkAuth = useCallback(async (force = false) => {
    if (!mountedRef.current) return;

    return requestManager.executeRequest('checkAuth', async () => {
      // Rate limiting check
      if (!requestManager.shouldCheckAuth(force)) {
        if (!initialized) { // initialized is state, so it needs to be a dependency if used inside useCallback
          setLoading(false);
          setInitialized(true);
        }
        return;
      }

      // Skip if already authenticated and not forcing
      if (isAuthenticated && !force) { // isAuthenticated is state, so it needs to be a dependency
        if (!initialized) {
          setLoading(false);
          setInitialized(true);
        }
        return;
      }

      console.log('🔍 Checking authentication...');
      setLoading(true);

      try {
        const response = await api.post('/api/auth/refresh');
        
        if (!mountedRef.current) return;
        
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
          console.log('✅ Auth verified:', response.data.username || response.data.email);
        } else {
          throw new Error('No user data received');
        }
      } catch (error) {
        if (!mountedRef.current) return;
        
        const status = error.response?.status;
        
        if ([401, 403].includes(status)) {
          console.log("🔒 User not authenticated");
        } else if (status === 429) {
          console.warn("⏳ Rate limited during auth check");
          // Don't reset auth for rate limiting
        } else {
          console.error("❌ Auth check failed:", error);
        }
        
        // Only reset auth state for actual auth failures, not rate limits
        if (status !== 429) {
          resetAuthState(); // resetAuthState is a dependency
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setInitialized(true);
        }
      }
    });
  }, [initialized, isAuthenticated, resetAuthState]); // Dependencies for checkAuth

  // Handle auth failures from axios interceptor
  useEffect(() => {
    const handleAuthFailure = (event) => {
      console.log('🔄 Auth failure event received');
      resetAuthState();
      if (event.detail?.shouldRedirect) {
        router.push('/auth/signin');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-failure', handleAuthFailure);
      return () => {
        window.removeEventListener('auth-failure', handleAuthFailure);
      };
    }
  }, [resetAuthState, router]); // Dependencies for this useEffect

  // Component lifecycle management
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestManager.clearAll();
    };
  }, []);

  // Initialize auth check ONCE on mount
  useEffect(() => {
    if (!initialized) { // initialized is state, so it needs to be a dependency
      console.log('🚀 Initializing auth...');
      
      const timer = setTimeout(() => {
        if (mountedRef.current && !initialized) {
          checkAuth(); // checkAuth is a dependency
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [initialized, checkAuth]); // Dependencies for this useEffect

  const login = useCallback(async (email, password) => {
    return requestManager.executeRequest('login', async () => {
      if (!mountedRef.current) return;
      
      setLoading(true);
      console.log('🔐 Logging in:', email);
      
      try {
        const response = await api.post('/api/auth/signin', { email, password });
        
        if (!mountedRef.current) return;
        
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
          setInitialized(true);
          
          console.log('✅ Login successful:', response.data.username);
          
          toast({ 
            title: "Welcome back!", 
            description: `Hello ${response.data.username || response.data.email}`, 
            variant: "success" 
          });
          
          setTimeout(() => {
            if (mountedRef.current) {
              router.push('/dashboard');
            }
          }, 100);
        }
      } catch (error) {
        if (!mountedRef.current) return;
        
        console.error("❌ Login failed:", error);
        resetAuthState();
        
        let errorMessage = 'Login failed. Please try again.';
        if (error.response?.status === 429) {
          errorMessage = 'Too many login attempts. Please wait and try again.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        toast({ 
          title: "Login Failed", 
          description: errorMessage, 
          variant: "destructive" 
        });
        
        throw new Error(errorMessage);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    });
  }, [toast, router, resetAuthState]); // Dependencies for login

  const register = useCallback(async (username, email, password) => {
    return requestManager.executeRequest('register', async () => {
      if (!mountedRef.current) return;
      
      setLoading(true);
      console.log('📝 Registering:', username, email);
      
      try {
        const response = await api.post('/api/auth/signup', { username, email, password });
        
        if (!mountedRef.current) return;
        
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
          setInitialized(true);
          
          console.log('✅ Registration successful:', response.data.username);
          
          toast({ 
            title: "Welcome to PortfolioHub!", 
            description: `Account created for ${response.data.username}`, 
            variant: "success" 
          });
          
          setTimeout(() => {
            if (mountedRef.current) {
              router.push('/dashboard');
            }
          }, 100);
        }
      } catch (error) {
        if (!mountedRef.current) return;
        
        console.error("❌ Registration failed:", error);
        resetAuthState();
        
        let errorMessage = 'Registration failed. Please try again.';
        if (error.response?.status === 429) {
          errorMessage = 'Too many registration attempts. Please wait and try again.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        toast({ 
          title: "Registration Failed", 
          description: errorMessage, 
          variant: "destructive" 
        });
        
        throw new Error(errorMessage);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    });
  }, [toast, router, resetAuthState]); // Dependencies for register

  const logout = useCallback(async (showToast = true) => {
    return requestManager.executeRequest('logout', async () => {
      console.log('🚪 Logging out...');
      setLoading(true);
      
      try {
        await api.post('/api/auth/logout');
      } catch (error) {
        console.warn("⚠️ Logout API failed:", error.message);
      }
      
      resetAuthState();
      setInitialized(true); // Should always set initialized to true after an explicit logout attempt
      
      if (showToast && mountedRef.current) {
        toast({ 
          title: "Logged Out", 
          description: "Successfully logged out.", 
          variant: "default" 
        });
      }
      
      if (mountedRef.current) {
        router.push('/auth/signin');
        setLoading(false);
      }
    });
  }, [resetAuthState, toast, router]); // Dependencies for logout

  const refreshUser = useCallback(async () => {
    return requestManager.executeRequest('refreshUser', async () => {
      try {
        const response = await api.get('/api/user/profile');
        if (response.data && mountedRef.current) {
          setUser(response.data);
          console.log('🔄 User profile refreshed');
        }
      } catch (error) {
        if (!mountedRef.current) return;
        
        console.error("❌ Profile refresh failed:", error);
        
        if ([401, 403].includes(error.response?.status)) {
          console.log("🔒 Auth error - logging out");
          await logout(false);
        }
      }
    });
  }, [logout]); // Dependency: logout

  const updateUser = useCallback((updatedUserData) => {
    if (mountedRef.current) {
      setUser(prev => ({ ...prev, ...updatedUserData }));
      console.log('👤 User updated');
    }
  }, []); // No external dependencies, setUser is stable

  const reAuthenticate = useCallback(async () => {
    console.log('🔄 Re-authenticating...');
    await checkAuth(true);
  }, [checkAuth]); // Dependency: checkAuth

  const value = {
    // State
    user,
    isAuthenticated,
    loading,
    initialized,
    
    // Actions
    login,
    register,
    logout,
    checkAuth,
    refreshUser,
    updateUser,
    reAuthenticate,
    
    // Utilities
    clearAuthCookies,
    resetAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthUser() {
  const { user, isAuthenticated, loading } = useAuth();
  return { user, isAuthenticated, loading };
}

export function useAuthActions() {
  const { login, register, logout, refreshUser, updateUser, reAuthenticate } = useAuth();
  return { login, register, logout, refreshUser, updateUser, reAuthenticate };
}

export function useAuthState() {
  const { isAuthenticated, loading, initialized } = useAuth();
  return { isAuthenticated, loading, initialized };
}