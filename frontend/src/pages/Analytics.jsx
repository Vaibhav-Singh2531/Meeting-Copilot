import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Toaster } from 'react-hot-toast';

gsap.registerPlugin(useGSAP);

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef();

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

  useGSAP(() => {
    if (!data) return;

    // Stat cards entrance
    gsap.fromTo(
      '.gsap-stat-card',
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.4)' }
    );

    // Stat counters
    const objMeetings = { val: 0 };
    gsap.to(objMeetings, {
      val: data.totalMeetings,
      duration: 1.5,
      delay: 0.3,
      ease: 'power2.out',
      onUpdate: () => {
        const el = document.querySelector('.gsap-count-meetings');
        if (el) el.textContent = Math.round(objMeetings.val);
      }
    });

    const objHosted = { val: 0 };
    gsap.to(objHosted, {
      val: data.hostedCount,
      duration: 1.5,
      delay: 0.3,
      ease: 'power2.out',
      onUpdate: () => {
        const el = document.querySelector('.gsap-count-hosted');
        if (el) el.textContent = Math.round(objHosted.val);
      }
    });

    const objMinutes = { val: 0 };
    gsap.to(objMinutes, {
      val: data.totalMinutes,
      duration: 1.5,
      delay: 0.3,
      ease: 'power2.out',
      onUpdate: () => {
        const el = document.querySelector('.gsap-count-minutes');
        if (el) el.textContent = Math.round(objMinutes.val);
      }
    });

    const objAvg = { val: 0 };
    gsap.to(objAvg, {
      val: data.avgDurationMinutes,
      duration: 1.5,
      delay: 0.3,
      ease: 'power2.out',
      onUpdate: () => {
        const el = document.querySelector('.gsap-count-avg');
        if (el) el.textContent = Math.round(objAvg.val);
      }
    });

    // Charts section
    gsap.fromTo(
      '.gsap-chart',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, delay: 0.4, ease: 'power2.out' }
    );

    // Recent meetings list
    gsap.fromTo(
      '.gsap-meeting-row',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, delay: 0.6, ease: 'power2.out' }
    );

    // Back button
    gsap.fromTo(
      '.gsap-back',
      { opacity: 0, x: -15 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, { dependencies: [data], scope: containerRef });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="mx-auto max-w-5xl space-y-8 animate-pulse">
          <div className="h-16 w-full rounded-2xl bg-slate-800/50 border border-white/10"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
             <div className="h-28 rounded-2xl bg-slate-800/50 border border-white/10"></div>
             <div className="h-28 rounded-2xl bg-slate-800/50 border border-white/10"></div>
             <div className="h-28 rounded-2xl bg-slate-800/50 border border-white/10"></div>
             <div className="h-28 rounded-2xl bg-slate-800/50 border border-white/10"></div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
             <div className="h-72 rounded-2xl bg-slate-800/50 border border-white/10"></div>
             <div className="h-72 rounded-2xl bg-slate-800/50 border border-white/10"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 p-4">
        <div className="rounded-2xl border border-red-500/30 bg-slate-800/80 p-8 shadow-xl w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-3xl text-red-500">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Failed to load analytics</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-900 text-slate-200 selection:bg-blue-500/30 font-sans pb-12">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-800/50 backdrop-blur p-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-extrabold text-transparent">Meeting Copilot</span>
          <button 
            onClick={() => navigate('/dashboard')}
            className="gsap-back flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <span>←</span>
            <span>Dashboard</span>
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl p-6 sm:p-8 space-y-8">
        
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
            <span>📈</span>
            <span>Analytics</span>
          </h1>
          <p className="mt-1 text-slate-400">Insights from your meetings</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="gsap-stat-card relative flex items-center space-x-4 rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-transparent"></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 text-2xl">📅</div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Meetings</p>
              <p className="gsap-count-meetings text-2xl font-bold text-white">0</p>
            </div>
          </div>
          
          <div className="gsap-stat-card relative flex items-center space-x-4 rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-transparent"></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 text-2xl">🎤</div>
            <div>
              <p className="text-sm font-medium text-slate-400">Meetings Hosted</p>
              <p className="gsap-count-hosted text-2xl font-bold text-white">0</p>
            </div>
          </div>
          
          <div className="gsap-stat-card relative flex items-center space-x-4 rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-green-500 to-transparent"></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-400 text-2xl">⏱️</div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Minutes</p>
              <p className="gsap-count-minutes text-2xl font-bold text-white">0</p>
            </div>
          </div>
          
          <div className="gsap-stat-card relative flex items-center space-x-4 rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-orange-500 to-transparent"></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 text-2xl">📊</div>
            <div>
              <p className="text-sm font-medium text-slate-400">Avg Duration</p>
              <p className="text-2xl font-bold text-white"><span className="gsap-count-avg">0</span> <span className="text-sm font-normal text-slate-500">mins</span></p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Frequency Chart */}
          <div className="gsap-chart rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white">Meetings Over Time</h3>
            <p className="mb-6 text-sm text-slate-400">Weekly breakdown of meeting activity</p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.meetingFrequency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#334155' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Speakers Chart */}
          <div className="gsap-chart rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white">Top Speakers</h3>
            <p className="mb-6 text-sm text-slate-400">By total word count</p>
            {data.topSpeakers && data.topSpeakers.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topSpeakers} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="speakerName" tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} width={90} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#334155' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Bar dataKey="wordCount" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-900/50 text-slate-500">
                <span className="text-3xl mb-2">💬</span>
                <p>No transcript data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-sm overflow-hidden">
          <h3 className="text-lg font-bold text-white">Recent Meetings</h3>
          <p className="mb-6 text-sm text-slate-400">Your latest meeting history</p>
          
          {data.recentMeetings && data.recentMeetings.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="pb-3 font-medium px-4">Title</th>
                    <th className="pb-3 font-medium px-4">Date</th>
                    <th className="pb-3 font-medium px-4">Duration</th>
                    <th className="pb-3 font-medium px-4">Participants</th>
                    <th className="pb-3 font-medium px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.recentMeetings.map((m, idx) => (
                    <tr key={idx} className="gsap-meeting-row transition hover:bg-white/5">
                      <td className="py-4 px-4 font-medium text-white">{m.title}</td>
                      <td className="py-4 px-4 text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-slate-400">
                        {m.startedAt && m.endedAt ? `${Math.round((new Date(m.endedAt).getTime() - new Date(m.startedAt).getTime()) / 60000)} mins` : '-'}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        <span className="inline-flex items-center rounded-full bg-slate-700/50 border border-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                          {m.participantCount} users
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => navigate(`/meeting/${m.roomCode}`)}
                          className="inline-flex items-center rounded-lg border border-blue-500/50 px-3 py-1.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-500 hover:text-white"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-900/50 py-12 text-slate-500">
              <span className="text-3xl mb-2">📁</span>
              <p>No meetings recorded yet</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
