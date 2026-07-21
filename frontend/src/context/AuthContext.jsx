import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Attempt to refresh token using the existing axios instance
        const { data } = await api.post('/auth/refresh');
        const token = data.accessToken;
        
        // Save the new access token to localStorage so our interceptor can use it
        localStorage.setItem('accessToken', token);
        setAccessToken(token);

        // Now fetch the current user's details using the attached access token
        const userRes = await api.get('/auth/me');
        setUser(userRes.data.user);
      } catch (error) {
        // If refresh fails (e.g. no cookie or expired), ensure state is clear
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem('accessToken', token);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and localStorage regardless of API success to force local logout
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    }
  };

  // Prevent flashing the login page on hard refresh while checking session
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-xl font-semibold text-gray-700">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
