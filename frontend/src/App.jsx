import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import CreateMeeting from './pages/CreateMeeting';
import MeetingDetail from './pages/MeetingDetail';
import Room from './pages/Room';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create" 
        element={
          <ProtectedRoute>
            <CreateMeeting />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/meeting/:roomCode" 
        element={
          <ProtectedRoute>
            <MeetingDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/room/:roomCode" 
        element={
          <ProtectedRoute>
            <Room />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
