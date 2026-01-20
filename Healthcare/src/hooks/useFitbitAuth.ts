// hooks/useFitbitAuth.ts
import { useState, useEffect } from 'react';
import { FitbitService } from '@/services/fitbitService';

export function useFitbitAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token
    const storedToken = localStorage.getItem('fitbit_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
      setIsAuthenticated(true);
    }

    // Check if we're on the callback URL with token in hash
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const token = FitbitService.parseAccessToken(hash);
      if (token) {
        localStorage.setItem('fitbit_access_token', token);
        setAccessToken(token);
        setIsAuthenticated(true);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    setIsLoading(false);
  }, []);

  const login = () => {
    window.location.href = FitbitService.getAuthUrl();
  };

  const logout = () => {
    localStorage.removeItem('fitbit_access_token');
    setAccessToken(null);
    setIsAuthenticated(false);
  };

  return {
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}