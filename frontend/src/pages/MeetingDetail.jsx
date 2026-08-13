import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function MeetingDetail() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [transcripts, setTranscripts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetingRes, transcriptsRes] = await Promise.all([
          api.get(`/meetings/${roomCode}`),
          api.get(`/meetings/${roomCode}/transcripts`)
        ]);
        setMeeting(meetingRes.data);
        setTranscripts(transcriptsRes.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch meeting details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roomCode]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-lg font-medium text-gray-600">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-red-700">Error</h2>
          <p className="text-red-600">{error || 'Meeting not found'}</p>
          <button 
            onClick={() => navigate('/analytics')}
            className="mt-6 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            Back to Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header Section */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center space-x-4">
            <button 
              onClick={() => navigate('/analytics')}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              ← Back
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
              <p className="text-sm text-gray-500">Room: {meeting.roomCode}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-lg bg-gray-100 px-4 py-2">
              <span className="block text-xs font-semibold text-gray-500">Date</span>
              <span className="font-medium text-gray-900">{new Date(meeting.createdAt).toLocaleString()}</span>
            </div>
            
            <div className="rounded-lg bg-gray-100 px-4 py-2">
              <span className="block text-xs font-semibold text-gray-500">Duration</span>
              <span className="font-medium text-gray-900">
                {meeting.durationSec != null ? `${Math.round(meeting.durationSec / 60)} mins` : 'N/A'}
              </span>
            </div>

            <div className="rounded-lg bg-gray-100 px-4 py-2">
              <span className="block text-xs font-semibold text-gray-500">Status</span>
              <span className={`font-bold ${
                meeting.status === 'DONE' ? 'text-green-600' :
                meeting.status === 'PROCESSING' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {meeting.status}
              </span>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Participants</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {meeting.participants && meeting.participants.map((p, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-gray-50 p-4 transition hover:shadow-sm">
                {p.user.avatarUrl ? (
                  <img src={p.user.avatarUrl} alt="avatar" className="mb-3 h-12 w-12 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600 shadow-sm">
                    {p.user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="truncate text-center font-semibold text-gray-800 w-full">{p.user.name}</span>
                <span className={`mt-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  p.role === 'HOST' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'
                }`}>
                  {p.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary Section */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Meeting Summary</h2>
          {meeting.finalSummary ? (
            <div className="rounded-lg bg-blue-50 p-6 text-gray-800 whitespace-pre-wrap leading-relaxed shadow-inner">
              {meeting.finalSummary}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-gray-500">
              <p>Summary not available yet</p>
            </div>
          )}
        </div>

        {/* Action Items Section */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Action Items</h2>
          {meeting.actionItems && meeting.actionItems.length > 0 ? (
            <ul className="space-y-3">
              {meeting.actionItems.map((item, idx) => (
                <li key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition hover:bg-white hover:shadow-sm">
                  <div className="flex flex-col mb-2 sm:mb-0">
                    <span className="font-semibold text-gray-900">{item.title}</span>
                    {item.assigneeName && (
                      <span className="mt-1 text-sm text-gray-500">Assignee: <span className="font-medium text-gray-700">{item.assigneeName}</span></span>
                    )}
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                      item.priority === 'LOW' ? 'bg-green-100 text-green-700' :
                      item.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      item.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-gray-500">
              <p>No action items recorded</p>
            </div>
          )}
        </div>

        {/* Transcript Section */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Full Transcript</h2>
          {transcripts && transcripts.length > 0 ? (
            <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-6 space-y-4">
              {transcripts.map((t, i) => (
                <div key={i} className="text-gray-800 leading-relaxed">
                  <span className="font-bold text-blue-600 mr-2">{t.speakerName}:</span>
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-gray-500">
              <p>No transcript available</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
