import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function CreateMeeting() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/meetings/create', { title });
      navigate(`/room/${data.roomCode}`);
    } catch (err) {
      setError('Failed to create meeting. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-extrabold text-gray-900">Start a New Meeting</h1>
        
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Meeting title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Creating...' : 'Create Meeting'}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm font-medium text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
