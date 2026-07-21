import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    // If someone visits this page directly without a token, boot them to login
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    const authenticate = async () => {
      try {
        // Optimistically set the token so the api interceptor picks it up
        localStorage.setItem('accessToken', token);
        
        // Fetch the user object from the backend
        const { data } = await api.get('/auth/me');
        
        // Log the user in through context
        login(data.user, token);
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Failed to fetch user in callback:', error);
        localStorage.removeItem('accessToken');
        navigate('/', { replace: true });
      }
    };

    authenticate();
  }, [searchParams, navigate, login]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <p className="text-xl font-medium text-gray-600 animate-pulse">Authenticating...</p>
    </div>
  );
}
