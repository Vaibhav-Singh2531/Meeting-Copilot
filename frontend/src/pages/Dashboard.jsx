import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinCode.trim()) {
      navigate(`/room/${joinCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Profile Card */}
        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={`${user.name}'s avatar`} 
                  className="h-16 w-16 rounded-full object-cover shadow-sm ring-2 ring-gray-100"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600 shadow-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="rounded-lg bg-red-50 px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Meeting Actions */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Start Meeting */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-white p-8 text-center shadow-md">
            <h2 className="mb-2 text-xl font-bold text-gray-800">Start a Meeting</h2>
            <p className="mb-6 text-sm text-gray-500">Create a new meeting room and invite others.</p>
            <button
              onClick={() => navigate('/create')}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Start New Meeting
            </button>
          </div>

          {/* Join Meeting */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-white p-8 text-center shadow-md">
            <h2 className="mb-2 text-xl font-bold text-gray-800">Join a Meeting</h2>
            <p className="mb-6 text-sm text-gray-500">Enter a room code to join an existing meeting.</p>
            <form onSubmit={handleJoin} className="w-full space-y-3">
              <input
                type="text"
                placeholder="Room Code (e.g., XK9-PLM)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!joinCode.trim()}
                className="w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              >
                Join Meeting
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
