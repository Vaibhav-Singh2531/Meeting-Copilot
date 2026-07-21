import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user } = useAuth();

  // If already authenticated, bypass login
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-gray-900">Meeting Copilot</h1>
        <p className="mb-8 text-lg text-gray-500">Your intelligent meeting assistant.</p>
        
        <a 
          href="http://localhost:5000/api/auth/google/redirect"
          className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google logo" 
            className="mr-3 h-5 w-5" 
          />
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
