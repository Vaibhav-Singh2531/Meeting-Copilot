import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

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

  const handleCopySummary = () => {
    if (meeting?.finalSummary) {
      navigator.clipboard.writeText(meeting.finalSummary);
      toast.success('Summary copied!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="mx-auto max-w-6xl space-y-8 animate-pulse">
          <div className="h-16 w-full rounded-2xl bg-slate-800/50 border border-white/10"></div>
          <div className="h-32 w-full rounded-2xl bg-slate-800/50 border border-white/10"></div>
          <div className="h-40 w-full rounded-2xl bg-slate-800/50 border border-white/10"></div>
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3 h-96 rounded-2xl bg-slate-800/50 border border-white/10"></div>
            <div className="col-span-2 space-y-6">
               <div className="h-64 rounded-2xl bg-slate-800/50 border border-white/10"></div>
               <div className="h-48 rounded-2xl bg-slate-800/50 border border-white/10"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 p-4">
        <div className="rounded-2xl border border-red-500/30 bg-slate-800/80 p-8 shadow-xl w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-3xl text-red-500">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-6">{error || 'Meeting not found'}</p>
          <button 
            onClick={() => navigate('/analytics')} 
            className="w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 transition"
          >
            Back to Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans pb-12">
      <Navbar />

      <div className="mx-auto max-w-6xl p-6 sm:p-8 space-y-6">
        
        {/* Header Section */}
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <h1 className="text-3xl font-extrabold text-white mb-4">{meeting.title}</h1>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-slate-700/50 px-3 py-1 text-sm text-slate-300">
              <span>📅</span>
              <span>{new Date(meeting.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-slate-700/50 px-3 py-1 text-sm text-slate-300">
              <span>⏱️</span>
              <span>{meeting.durationSec != null ? `${Math.round(meeting.durationSec / 60)} mins` : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-slate-700/50 px-3 py-1 text-sm text-slate-300">
              <span>👥</span>
              <span>{meeting.participants ? meeting.participants.length : 0}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-slate-700/50 px-3 py-1 text-sm text-slate-300 font-bold">
              <span className={`h-2 w-2 rounded-full ${meeting.status === 'DONE' ? 'bg-green-500' : meeting.status === 'PROCESSING' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
              <span className={`${meeting.status === 'DONE' ? 'text-green-400' : meeting.status === 'PROCESSING' ? 'text-yellow-400' : 'text-red-400'}`}>
                {meeting.status}
              </span>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div className="w-full">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
            {meeting.participants && meeting.participants.map((p, idx) => (
              <div key={idx} className="flex min-w-[160px] flex-col items-center justify-center rounded-xl border border-white/10 bg-slate-800/50 p-4 transition hover:bg-white/5">
                {p.user.avatarUrl ? (
                  <img src={p.user.avatarUrl} alt="avatar" className="mb-3 h-12 w-12 rounded-full object-cover shadow-sm ring-2 ring-slate-700" />
                ) : (
                  <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold shadow-sm ring-2 ring-slate-700 ${p.role === 'HOST' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
                    {p.user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="truncate text-center font-semibold text-white w-full">{p.user.name}</span>
                <span className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  p.role === 'HOST' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-700/50 text-slate-400 border border-white/5'
                }`}>
                  {p.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          
          {/* Left Column: Transcript (span 3) */}
          <div className="lg:col-span-3">
            <div className="flex h-full flex-col rounded-xl border border-white/10 bg-slate-800/50 overflow-hidden">
              <div className="border-b border-white/10 p-5 bg-slate-800/80">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <span>📄</span>
                  <span>Full Transcript</span>
                </h2>
              </div>
              <div className="h-96 overflow-y-auto">
                {transcripts && transcripts.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {transcripts.map((t, i) => (
                      <div key={i} className="p-4 transition hover:bg-white/5 even:bg-white/5">
                        <span className="font-semibold text-blue-400 mr-2">{t.speakerName}:</span>
                        <span className="text-slate-300 leading-relaxed">{t.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center py-12 text-slate-500">
                    <span className="text-4xl mb-3">📭</span>
                    <p>No transcript available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Summary & Action Items (span 2) */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            
            {/* AI Summary */}
            <div className="rounded-xl border border-white/10 bg-slate-800/50 p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <span className="text-blue-400">✨</span>
                  <span>Meeting Summary</span>
                </h2>
                {meeting.finalSummary && (
                  <button 
                    onClick={handleCopySummary}
                    className="flex items-center gap-1 rounded-md border border-white/10 bg-slate-700/50 px-2 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-600"
                  >
                    <span>📋</span> Copy
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {meeting.finalSummary ? (
                  <div className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                    {meeting.finalSummary}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <p>Summary not available yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Items */}
            <div className="rounded-xl border border-white/10 bg-slate-800/50 p-5 shadow-sm flex-1">
              <div className="mb-4 border-b border-white/10 pb-3">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <span>📋</span>
                  <span>Action Items</span>
                </h2>
              </div>
              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {meeting.actionItems && meeting.actionItems.length > 0 ? (
                  <ul className="space-y-3">
                    {meeting.actionItems.map((item, idx) => (
                      <li key={idx} className="flex flex-col rounded-lg border border-white/5 bg-slate-900/50 p-4 transition hover:border-white/10 hover:bg-slate-800">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-white">{item.title}</span>
                          <span className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide border ${
                            item.priority === 'LOW' ? 'border-green-500/20 bg-green-500/10 text-green-400' :
                            item.priority === 'MEDIUM' ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400' :
                            item.priority === 'HIGH' ? 'border-orange-500/20 bg-orange-500/10 text-orange-400' :
                            'border-red-500/20 bg-red-500/10 text-red-400'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                        {item.assigneeName && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                            <span>👤</span>
                            <span>{item.assigneeName}</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <p>No action items recorded</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
