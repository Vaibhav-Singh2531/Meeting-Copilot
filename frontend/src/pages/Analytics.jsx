import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Navbar from '../components/Navbar';

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
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
        <Navbar />
        <div style={{ margin: '2rem auto', maxWidth: '1120px', padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: '7rem', borderRadius: '1rem', backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)', padding: '1rem' }}>
        <div style={{ borderRadius: '1rem', border: '1px solid var(--border)', backgroundColor: 'var(--card)', padding: '2rem', boxShadow: 'var(--shadow-panel)', width: '100%', maxWidth: '28rem', textAlign: 'center' }}>
          <div style={{ margin: '0 auto 1rem', display: 'flex', width: '64px', height: '64px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'var(--highlight-wash)', fontSize: '1.75rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Failed to load analytics</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ width: '100%', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', padding: '12px 16px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <Navbar />

      <div style={{ margin: '0 auto', maxWidth: '1120px', padding: '2.5rem 2.5rem 4rem' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand)' }} />
            Your activity
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Analytics</h1>
          <p style={{ marginTop: '6px', fontSize: '15px', color: 'var(--muted-foreground)' }}>Insights from your meetings</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Meetings',   countClass: 'gsap-count-meetings', icon: '📅', accent: 'var(--primary)' },
            { label: 'Meetings Hosted',  countClass: 'gsap-count-hosted',   icon: '🎤', accent: 'var(--highlight)' },
            { label: 'Total Minutes',    countClass: 'gsap-count-minutes',  icon: '⏱️', accent: 'var(--primary)' },
            { label: 'Avg Duration',     countClass: 'gsap-count-avg',      icon: '📊', accent: 'var(--highlight)', suffix: ' mins' },
          ].map(({ label, countClass, icon, accent, suffix }) => (
            <div
              key={label}
              className="gsap-stat-card"
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', padding: '1.5rem', boxShadow: 'var(--shadow-panel)', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, height: '3px', width: '100%', backgroundColor: accent, opacity: 0.5 }} />
              <div style={{ display: 'flex', width: '48px', height: '48px', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: 'var(--icon-wash)', fontSize: '1.4rem', flexShrink: 0 }}>{icon}</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--muted-foreground)', margin: 0 }}>{label}</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 700, margin: '2px 0 0' }}>
                  <span className={countClass}>0</span>
                  {suffix && <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--muted-foreground)' }}>{suffix}</span>}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {/* Frequency Chart */}
          <div className="gsap-chart" style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', padding: '1.5rem', boxShadow: 'var(--shadow-panel)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px' }}>Meetings Over Time</h3>
            <p style={{ marginBottom: '1.5rem', fontSize: '13px', color: 'var(--muted-foreground)' }}>Weekly breakdown of meeting activity</p>
            <div style={{ height: '288px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.meetingFrequency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', fontSize: '13px' }}
                  />
                  <Bar dataKey="count" fill="oklch(0.47 0.102 220)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Speakers Chart */}
          <div className="gsap-chart" style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', padding: '1.5rem', boxShadow: 'var(--shadow-panel)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px' }}>Top Speakers</h3>
            <p style={{ marginBottom: '1.5rem', fontSize: '13px', color: 'var(--muted-foreground)' }}>By total word count</p>
            {data.topSpeakers && data.topSpeakers.length > 0 ? (
              <div style={{ height: '288px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topSpeakers} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="speakerName" tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 500 }} width={90} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                      contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', fontSize: '13px' }}
                    />
                    <Bar dataKey="wordCount" fill="oklch(0.60 0.12 75)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ display: 'flex', height: '288px', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)', border: '1px dashed var(--border)', backgroundColor: 'var(--muted)', gap: '8px' }}>
                <span style={{ fontSize: '2rem' }}>💬</span>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: 0 }}>No transcript data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Meetings */}
        <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', padding: '1.5rem', boxShadow: 'var(--shadow-panel)', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px' }}>Recent Meetings</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>Your latest meeting history</p>

          {data.recentMeetings && data.recentMeetings.length > 0 ? (
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', fontSize: '14px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Title', 'Date', 'Duration', 'Participants', ''].map(h => (
                      <th key={h} style={{ paddingBottom: '12px', paddingLeft: '12px', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentMeetings.map((m, idx) => (
                    <tr
                      key={idx}
                      className="gsap-meeting-row"
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--muted)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
                    >
                      <td style={{ padding: '14px 12px', fontWeight: 600 }}>{m.title}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--muted-foreground)' }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--muted-foreground)' }}>
                        {m.startedAt && m.endedAt ? `${Math.round((new Date(m.endedAt) - new Date(m.startedAt)) / 60000)} mins` : '—'}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '9999px', border: '1px solid var(--border)', backgroundColor: 'var(--muted)', padding: '2px 10px', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)' }}>
                          {m.participantCount} users
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <button
                          onClick={() => navigate(`/meeting/${m.roomCode}`)}
                          style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '8px', border: '1px solid var(--border)', padding: '5px 14px', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'var(--background)', cursor: 'pointer', transition: 'background 0.12s, color 0.12s' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary-foreground)'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--background)'; e.currentTarget.style.color = 'var(--primary)'; }}
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)', border: '1px dashed var(--border)', backgroundColor: 'var(--muted)', padding: '3rem 1rem', gap: '8px' }}>
              <span style={{ fontSize: '2rem' }}>📁</span>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: 0 }}>No meetings recorded yet</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
