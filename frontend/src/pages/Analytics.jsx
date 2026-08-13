import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics');
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-lg font-medium text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm w-full max-w-md">
          <h2 className="text-lg font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="mt-6 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center space-x-4 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-2xl">📅</div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Meetings</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalMeetings}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 text-2xl">🎤</div>
            <div>
              <p className="text-sm font-medium text-gray-500">Meetings Hosted</p>
              <p className="text-2xl font-bold text-gray-900">{data.hostedCount}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 text-2xl">⏱️</div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Minutes</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalMinutes}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600 text-2xl">📊</div>
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">{data.avgDurationMinutes} <span className="text-sm font-normal text-gray-500">mins</span></p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Frequency Chart */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-gray-800">Meetings Over Time</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.meetingFrequency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Speakers Chart */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-gray-800">Top Speakers by Word Count</h3>
            {data.topSpeakers && data.topSpeakers.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topSpeakers} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="speakerName" tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 600 }} width={90} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="wordCount" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500">
                <p>No transcript data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-800">Recent Meetings</h3>
          {data.recentMeetings && data.recentMeetings.length > 0 ? (
            <div className="space-y-4">
              {data.recentMeetings.map((m, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-md">
                  <div className="mb-3 sm:mb-0">
                    <h4 className="font-semibold text-gray-900">{m.title}</h4>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span className="rounded bg-gray-100 px-2 py-1 font-medium">{new Date(m.createdAt).toLocaleDateString()}</span>
                      {m.startedAt && m.endedAt && (
                        <span className="rounded bg-blue-50 px-2 py-1 font-medium text-blue-700">{Math.round((new Date(m.endedAt).getTime() - new Date(m.startedAt).getTime()) / 60000)} mins</span>
                      )}
                      <span className="rounded bg-green-50 px-2 py-1 font-medium text-green-700">{m.participantCount} Participants</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/meeting/${m.roomCode}`)}
                    className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-10 text-center text-gray-500">
              <p>No meetings yet</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
