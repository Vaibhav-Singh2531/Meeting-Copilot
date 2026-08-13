import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      setSearchError(null);
      setSearchResults(null);
      
      const response = await api.get(`/meetings/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Search error:', err);
      setSearchError(err.response?.data?.error || err.message || 'An error occurred during search.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Search Past Meetings */}
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Search Past Meetings</h2>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0">
            <input
              type="text"
              placeholder="Ask anything about your past meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-500">Powered by RAG — search by meaning, not just keywords</p>

          {searchError && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
              {searchError}
            </div>
          )}

          {searchResults && (
            <div className="mt-8 space-y-6">
              {/* AI Answer */}
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                <h3 className="font-bold text-blue-900 mb-2">AI Answer</h3>
                <div className="whitespace-pre-wrap text-blue-800 leading-relaxed">
                  {searchResults.answer}
                </div>
              </div>

              {/* Relevant Meetings */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-800">Relevant Meetings</h3>
                {searchResults.meetings && searchResults.meetings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {searchResults.meetings.map(meeting => (
                      <div 
                        key={meeting.id} 
                        onClick={() => navigate(`/room/${meeting.roomCode}`)}
                        className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(meeting.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {meeting.finalSummary ? `${meeting.finalSummary.substring(0, 100)}...` : 'No summary available.'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No matching meetings found</p>
                )}
              </div>
            </div>
          )}
        </div>

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
            
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate('/analytics')}
                className="rounded-lg bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Analytics
              </button>
              <button 
                onClick={handleLogout}
                className="rounded-lg bg-red-50 px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Log out
              </button>
            </div>
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
