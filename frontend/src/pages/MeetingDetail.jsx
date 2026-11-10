import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5zM5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75zM19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z"/>
  </svg>
);
const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const ChecklistIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <polyline points="3 6 4 7 6 5"/><polyline points="3 12 4 13 6 11"/><polyline points="3 18 4 19 6 17"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

// ── Priority badge colour map ──────────────────────────────────────────────────
const PRIORITY = {
  LOW:      { bg: 'oklch(0.95 0.07 150)', color: 'oklch(0.42 0.14 150)', border: 'oklch(0.85 0.09 150)' },
  MEDIUM:   { bg: 'oklch(0.97 0.07 85)',  color: 'oklch(0.55 0.15 75)',  border: 'oklch(0.88 0.1 85)'  },
  HIGH:     { bg: 'oklch(0.96 0.07 55)',  color: 'oklch(0.55 0.17 50)',  border: 'oklch(0.87 0.1 55)'  },
  CRITICAL: { bg: 'oklch(0.96 0.06 25)',  color: 'oklch(0.55 0.2 27)',   border: 'oklch(0.87 0.1 25)'  },
};

const STATUS = {
  DONE:       { dot: 'oklch(0.76 0.13 170)', label: 'oklch(0.46 0.13 165)' },
  PROCESSING: { dot: 'oklch(0.78 0.13 75)',  label: 'oklch(0.55 0.15 75)'  },
  DEFAULT:    { dot: 'oklch(0.577 0.245 27)',label: 'oklch(0.577 0.245 27)'},
};

function getStatus(s) {
  return STATUS[s] ?? STATUS.DEFAULT;
}

export default function MeetingDetail() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting]       = useState(null);
  const [transcripts, setTranscripts] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetingRes, transcriptsRes] = await Promise.all([
          api.get(`/meetings/${roomCode}`),
          api.get(`/meetings/${roomCode}/transcripts`),
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

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
        <Navbar />
        <div style={{ margin: '0 auto', maxWidth: '1200px', padding: '2.5rem 2.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[80, 60, 48, 320].map((h, i) => (
            <div key={i} style={{ height: `${h}px`, borderRadius: 'var(--radius)', backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error || !meeting) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)', padding: '1rem' }}>
        <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', padding: '2rem', boxShadow: 'var(--shadow-panel)', width: '100%', maxWidth: '28rem', textAlign: 'center' }}>
          <div style={{ margin: '0 auto 1rem', display: 'flex', width: '64px', height: '64px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'var(--highlight-wash)', fontSize: '1.75rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Meeting not found</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '14px' }}>{error || 'The meeting could not be loaded.'}</p>
          <button
            onClick={() => navigate('/analytics')}
            style={{ width: '100%', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', padding: '12px 16px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            Back to Analytics
          </button>
        </div>
      </div>
    );
  }

  const statusColors = getStatus(meeting.status);

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <Navbar />

      <main style={{ margin: '0 auto', maxWidth: '1200px', padding: '2.5rem 2.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Back + heading ── */}
        <div>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1.25rem', fontSize: '13px', fontWeight: 500, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--foreground)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)'; }}
          >
            <ArrowLeftIcon /> Back
          </button>

          {/* Meeting header card */}
          <div style={{ position: 'relative', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', padding: '1.75rem 2rem', boxShadow: 'var(--shadow-panel)', overflow: 'hidden' }}>
            {/* Top accent bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--primary) 0%, var(--brand-mark) 100%)' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ marginBottom: '6px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand)' }}>Meeting Record</p>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{meeting.title || 'Untitled Meeting'}</h1>
              </div>
              {/* Status badge */}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '9999px', border: `1px solid ${statusColors.dot}`, padding: '5px 14px', fontSize: '12px', fontWeight: 600 }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: statusColors.dot, flexShrink: 0 }} />
                <span style={{ color: statusColors.label }}>{meeting.status}</span>
              </span>
            </div>

            {/* Meta chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1.25rem' }}>
              {[
                { icon: <CalendarIcon />, label: new Date(meeting.createdAt).toLocaleString() },
                { icon: <ClockIcon />,    label: meeting.durationSec != null ? `${Math.round(meeting.durationSec / 60)} mins` : 'N/A' },
                { icon: <UsersIcon />,    label: `${meeting.participants ? meeting.participants.length : 0} participants` },
              ].map(({ icon, label }) => (
                <span
                  key={label}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '9999px', border: '1px solid var(--border)', backgroundColor: 'var(--muted)', padding: '5px 14px', fontSize: '13px', fontWeight: 500, color: 'var(--muted-foreground)' }}
                >
                  <span style={{ color: 'var(--brand)' }}>{icon}</span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Participants row ── */}
        {meeting.participants && meeting.participants.length > 0 && (
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand)', marginBottom: '10px' }}>Participants</p>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {meeting.participants.map((p, idx) => (
                <div
                  key={idx}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '110px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', padding: '1rem 0.75rem', boxShadow: 'var(--shadow-panel)', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {p.user.avatarUrl ? (
                    <img
                      src={p.user.avatarUrl}
                      alt="avatar"
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', border: '2px solid var(--border)' }}
                    />
                  ) : (
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%', marginBottom: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem', fontWeight: 700,
                      backgroundColor: p.role === 'HOST' ? 'var(--icon-wash)' : 'var(--muted)',
                      color: p.role === 'HOST' ? 'var(--brand)' : 'var(--muted-foreground)',
                      border: `2px solid ${p.role === 'HOST' ? 'var(--border)' : 'var(--border)'}`,
                    }}>
                      {p.user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontSize: '13px', fontWeight: 600, textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.user.name}
                  </span>
                  <span style={{
                    marginTop: '5px', borderRadius: '9999px', padding: '2px 8px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                    backgroundColor: p.role === 'HOST' ? 'var(--icon-wash)' : 'var(--muted)',
                    color: p.role === 'HOST' ? 'var(--brand)' : 'var(--muted-foreground)',
                    border: '1px solid var(--border)',
                  }}>
                    {p.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Two-column: Transcript + Summary/Actions ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.25rem', alignItems: 'start' }}>

          {/* Transcript */}
          <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-panel)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', padding: '1rem 1.5rem', backgroundColor: 'var(--note)' }}>
              <span style={{ color: 'var(--brand)' }}><FileTextIcon /></span>
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Full Transcript</h2>
            </div>
            <div style={{ height: '400px', overflowY: 'auto' }}>
              {transcripts && transcripts.length > 0 ? (
                <div>
                  {transcripts.map((t, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '14px 1.5rem',
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--muted)',
                        fontSize: '14px', lineHeight: 1.65,
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'transparent' : 'var(--muted)'; }}
                    >
                      <span style={{ fontWeight: 700, color: 'var(--primary)', marginRight: '8px' }}>{t.speakerName}:</span>
                      <span style={{ color: 'var(--foreground)' }}>{t.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: 'var(--muted-foreground)' }}>
                  <span style={{ fontSize: '2.5rem' }}>📭</span>
                  <p style={{ fontSize: '14px', margin: 0 }}>No transcript available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* AI Summary */}
            <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-panel)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '1rem 1.5rem', backgroundColor: 'var(--note)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--brand)' }}><SparklesIcon /></span>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Meeting Summary</h2>
                </div>
                {meeting.finalSummary && (
                  <button
                    onClick={handleCopySummary}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', padding: '4px 10px', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--muted)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--background)'; }}
                  >
                    <CopyIcon /> Copy
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '260px', overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
                {meeting.finalSummary ? (
                  <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--foreground)', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {meeting.finalSummary}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', gap: '8px', color: 'var(--muted-foreground)' }}>
                    <span style={{ fontSize: '1.75rem' }}>✨</span>
                    <p style={{ fontSize: '14px', margin: 0 }}>Summary not available yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Items */}
            <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-panel)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', padding: '1rem 1.5rem', backgroundColor: 'var(--note)' }}>
                <span style={{ color: 'var(--brand)' }}><ChecklistIcon /></span>
                <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Action Items</h2>
                {meeting.actionItems && meeting.actionItems.length > 0 && (
                  <span style={{ marginLeft: 'auto', borderRadius: '9999px', border: '1px solid var(--border)', backgroundColor: 'var(--muted)', padding: '2px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)' }}>
                    {meeting.actionItems.length}
                  </span>
                )}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {meeting.actionItems && meeting.actionItems.length > 0 ? (
                  meeting.actionItems.map((item, idx) => {
                    const p = PRIORITY[item.priority] ?? PRIORITY.LOW;
                    return (
                      <div
                        key={idx}
                        style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', padding: '12px 14px', transition: 'border-color 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.title}</span>
                          <span style={{ flexShrink: 0, borderRadius: '4px', border: `1px solid ${p.border}`, backgroundColor: p.bg, color: p.color, padding: '1px 7px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                            {item.priority}
                          </span>
                        </div>
                        {item.assigneeName && (
                          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                            <span>👤</span>
                            <span>{item.assigneeName}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', gap: '8px', color: 'var(--muted-foreground)' }}>
                    <span style={{ fontSize: '1.75rem' }}>📋</span>
                    <p style={{ fontSize: '14px', margin: 0 }}>No action items recorded</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
