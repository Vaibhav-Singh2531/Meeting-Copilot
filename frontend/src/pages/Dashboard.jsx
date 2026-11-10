import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

gsap.registerPlugin(useGSAP);

// ── Icons (inline SVG, no extra dep needed) ──────────────────────────────────
const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
  </svg>
);
const HeadphonesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
  </svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5zM5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75zM19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z"/>
  </svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const WavesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
  </svg>
);
const AudioLinesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v3"/>
  </svg>
);
const FileSearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h14a2 2 0 002-2V7.5L14.5 2H6a2 2 0 00-2 2v3"/><polyline points="14 2 14 8 20 8"/><circle cx="4.5" cy="16.5" r="2.5"/><path d="M7 19l-1.5-1.5"/>
  </svg>
);
const UsersRoundIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 21a8 8 0 00-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 00-.45-8.3"/>
  </svg>
);
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const ArrowUpRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
  </svg>
);
const ArrowDownRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/>
  </svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Sidebar feature list ──────────────────────────────────────────────────────
const moments = [
  { title: 'Meeting highlights', icon: SparklesIcon, description: 'Catch the key points without replaying the whole call.' },
  { title: 'Find any moment',    icon: FileSearchIcon, description: 'Search your conversations for decisions and details.' },
  { title: 'Everyone in sync',  icon: UsersRoundIcon, description: 'Keep your team focused on what comes next.' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const containerRef = useRef();

  // Search
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching]   = useState(false);
  const [searchMessage, setSearchMessage] = useState('');

  // Join
  const [joinCode, setJoinCode] = useState('');

  // Start meeting dialog
  const [dialog, setDialog] = useState(null); // { title, message, code? }
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Entrance animations ───────────────────────────────────────────────────
  useGSAP(() => {
    gsap.fromTo('.gsap-header', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    gsap.fromTo('.gsap-hero',   { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' });
    gsap.fromTo('.gsap-card',   { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, delay: 0.2, ease: 'power2.out' });
  }, { scope: containerRef });

  useGSAP(() => {
    if (searchResults) {
      gsap.fromTo('.gsap-results', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
  }, { dependencies: [searchResults], scope: containerRef });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchMessage('Add a topic, decision, or phrase to search.');
      return;
    }
    try {
      setIsSearching(true);
      setSearchMessage('');
      setSearchResults(null);
      const response = await api.get(`/meetings/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (err) {
      setSearchMessage(err.response?.data?.error || err.message || 'An error occurred during search.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartMeeting = async () => {
    try {
      setIsCreating(true);
      setCopied(false);
      const { data } = await api.post('/meetings/create', { title: '' });
      setDialog({
        title: 'Your room is ready',
        message: 'Share the room code with your guests when you\'re ready to begin.',
        code: data.roomCode,
        roomCode: data.roomCode,
      });
    } catch (err) {
      toast.error('Failed to create meeting. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinCode.trim()) {
      navigate(`/room/${joinCode.trim().toUpperCase()}`);
    }
  };

  const handleEnterRoom = () => {
    if (dialog?.roomCode) navigate(`/room/${dialog.roomCode}`);
  };

  const copyCode = async () => {
    if (!dialog?.code) return;
    try {
      await navigator.clipboard.writeText(dialog.code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div ref={containerRef} style={{ minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="gsap-header" style={{ borderBottom: '1px solid var(--topbar-border)', backgroundColor: 'var(--topbar)', color: 'var(--topbar-foreground)' }}>
        <div style={{ margin: '0 auto', display: 'grid', minHeight: '76px', width: '100%', maxWidth: '1320px', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', padding: '0 2.5rem' }}>

          {/* Logo */}
          <Link to="/dashboard" aria-label="Meeting Copilot home" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', minWidth: 0 }}>
            <span style={{ display: 'grid', width: '40px', height: '40px', flexShrink: 0, placeItems: 'center', borderRadius: '8px', backgroundColor: 'var(--brand-mark)', color: 'var(--brand-mark-foreground)' }}>
              <WavesIcon />
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--topbar-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Meeting Copilot
            </span>
          </Link>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Link
              to="/dashboard"
              style={{
                padding: '6px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'background 0.15s',
                backgroundColor: 'var(--topbar-selected)', color: 'var(--topbar-selected-foreground)'
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/analytics"
              style={{
                padding: '6px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'background 0.15s',
                color: 'var(--topbar-muted)',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--topbar-foreground)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--topbar-muted)'; }}
            >
              Analytics
            </Link>
          </nav>

          {/* User area */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <span style={{ display: 'grid', width: '36px', height: '36px', placeItems: 'center', borderRadius: '50%', backgroundColor: 'var(--avatar)', color: 'var(--avatar-foreground)', fontSize: '14px', fontWeight: 600, flexShrink: 0 }}>
              {userInitial}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--topbar-muted)' }}>{user?.name}</span>
            <span style={{ width: '1px', height: '20px', backgroundColor: 'var(--topbar-border)' }} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '9999px', border: '1px solid var(--online-border)', backgroundColor: 'var(--online)', padding: '4px 10px', fontSize: '12px', fontWeight: 500, color: 'var(--online-foreground)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--online-dot)', flexShrink: 0 }} />
              Online
            </span>
            <button
              onClick={handleLogout}
              style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '13px', color: 'var(--topbar-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--topbar-foreground)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--topbar-muted)'; }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main style={{ margin: '0 auto', width: '100%', maxWidth: '1320px', padding: '2.5rem 2.5rem 4rem' }}>

        {/* Page heading row */}
        <div className="gsap-hero" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '2.25rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand)' }} />
              Your workspace
            </p>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Welcome back, {user?.name?.split(' ')[0] || 'there'}</h1>
            <p style={{ marginTop: '8px', fontSize: '15px', color: 'var(--muted-foreground)' }}>Make space for a great conversation.</p>
          </div>
          <button
            onClick={handleStartMeeting}
            disabled={isCreating}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              height: '44px', padding: '0 20px', borderRadius: 'var(--radius)',
              backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)',
              fontWeight: 600, fontSize: '14px', border: 'none', cursor: isCreating ? 'wait' : 'pointer',
              opacity: isCreating ? 0.7 : 1, transition: 'opacity 0.15s, filter 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => { if (!isCreating) e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
          >
            <PlusIcon />
            {isCreating ? 'Starting…' : 'Start a meeting'}
          </button>
        </div>

        {/* Two-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Left column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Search card */}
            <div className="gsap-card" style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-panel)', overflow: 'hidden' }}>
              <div style={{ padding: '1.75rem 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem' }}>
                  <div>
                    <p style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, color: 'var(--brand)' }}>
                      <SparklesIcon />
                      YOUR MEETINGS, MADE SEARCHABLE
                    </p>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Find the moment.</h2>
                    <p style={{ marginTop: '6px', fontSize: '14px', lineHeight: 1.6, color: 'var(--muted-foreground)', maxWidth: '480px' }}>
                      Find a decision, a detail, or that one thing someone said.
                    </p>
                  </div>
                  <div style={{ display: 'grid', width: '76px', height: '76px', placeItems: 'center', borderRadius: '12px', backgroundColor: 'var(--icon-wash)', color: 'var(--brand)', flexShrink: 0 }}>
                    <AudioLinesIcon />
                  </div>
                </div>

                <form onSubmit={handleSearch}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none' }}>
                        <SearchIcon />
                      </span>
                      <input
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setSearchMessage(''); }}
                        placeholder='Try "the launch date" or "next steps"…'
                        style={{
                          width: '100%', height: '50px', paddingLeft: '44px', paddingRight: '14px',
                          border: '1px solid var(--input)', borderRadius: 'var(--radius)',
                          backgroundColor: 'var(--background)', color: 'var(--foreground)',
                          fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                          transition: 'border-color 0.15s',
                        }}
                        onFocus={e => { e.target.style.borderColor = 'var(--brand)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--input)'; }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching}
                      style={{
                        height: '50px', padding: '0 24px', borderRadius: 'var(--radius)',
                        backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)',
                        fontWeight: 600, fontSize: '14px', border: 'none', cursor: isSearching ? 'wait' : 'pointer',
                        flexShrink: 0, opacity: isSearching ? 0.7 : 1,
                      }}
                    >
                      {isSearching ? 'Searching…' : 'Search meetings'}
                    </button>
                  </div>
                  <p aria-live="polite" style={{ marginTop: '10px', minHeight: '20px', fontSize: '12px', color: searchMessage.startsWith('No matches') || searchMessage === '' ? 'var(--muted-foreground)' : 'var(--destructive)' }}>
                    {searchMessage || "Search across the things you've discussed."}
                  </p>
                </form>

                {/* Search results */}
                {searchResults && (
                  <div className="gsap-results" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {searchResults.answer && (
                      <div style={{ borderLeft: '3px solid var(--primary)', backgroundColor: 'var(--note)', borderRadius: '0 8px 8px 0', padding: '1rem 1.25rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: 'var(--foreground)' }}>AI Answer</h3>
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: 1.7, color: 'var(--note-foreground)' }}>{searchResults.answer}</div>
                      </div>
                    )}
                    {searchResults.meetings && searchResults.meetings.length > 0 && (
                      <div>
                        <h3 style={{ fontWeight: 600, fontSize: '15px', marginBottom: '10px' }}>Relevant Meetings</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {searchResults.meetings.map(meeting => (
                            <div
                              key={meeting.id}
                              onClick={() => navigate(`/room/${meeting.roomCode}`)}
                              style={{ cursor: 'pointer', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', padding: '14px 16px', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = ''; }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontWeight: 600, fontSize: '14px' }}>{meeting.title}</span>
                                <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{new Date(meeting.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: 0 }}>
                                {meeting.finalSummary ? `${meeting.finalSummary.substring(0, 100)}…` : 'No summary available.'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Start / Join row */}
            <div>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand)', margin: 0 }}>Jump right in</p>
                <h2 style={{ marginTop: '4px', fontSize: '1.1rem', fontWeight: 700 }}>Make it a conversation</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Start meeting card */}
                <div className="gsap-card" style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', padding: '1.5rem', boxShadow: 'var(--shadow-panel)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ display: 'grid', width: '40px', height: '40px', placeItems: 'center', borderRadius: '8px', backgroundColor: 'var(--icon-wash)', color: 'var(--brand)', flexShrink: 0 }}>
                      <VideoIcon />
                    </span>
                    <h3 style={{ fontWeight: 700, fontSize: '15px', margin: 0 }}>Start a meeting</h3>
                  </div>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--muted-foreground)', marginBottom: '1rem', minHeight: '40px' }}>Open a new room and invite people to join.</p>
                  <button
                    onClick={handleStartMeeting}
                    disabled={isCreating}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', height: '40px', padding: '0 14px', borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)', backgroundColor: 'var(--background)',
                      color: 'var(--foreground)', fontSize: '14px', fontWeight: 500, cursor: isCreating ? 'wait' : 'pointer',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.backgroundColor = 'var(--icon-wash)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'var(--background)'; }}
                  >
                    {isCreating ? 'Starting…' : 'Start a new meeting'}
                    <ArrowUpRightIcon />
                  </button>
                </div>

                {/* Join meeting card */}
                <div className="gsap-card" style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', padding: '1.5rem', boxShadow: 'var(--shadow-panel)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ display: 'grid', width: '40px', height: '40px', placeItems: 'center', borderRadius: '8px', backgroundColor: 'var(--icon-wash)', color: 'var(--brand)', flexShrink: 0 }}>
                      <HeadphonesIcon />
                    </span>
                    <h3 style={{ fontWeight: 700, fontSize: '15px', margin: 0 }}>Join a meeting</h3>
                  </div>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--muted-foreground)', marginBottom: '1rem', minHeight: '40px' }}>Have a room code? You're one step away.</p>
                  <form onSubmit={handleJoin} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="Enter room code"
                      maxLength={12}
                      style={{
                        flex: 1, minWidth: 0, height: '40px', padding: '0 12px',
                        border: '1px solid var(--input)', borderRadius: 'var(--radius)',
                        backgroundColor: 'var(--background)', color: 'var(--foreground)',
                        fontSize: '14px', textTransform: 'uppercase', outline: 'none',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'var(--brand)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--input)'; }}
                    />
                    <button
                      type="submit"
                      disabled={!joinCode.trim()}
                      aria-label="Join meeting"
                      style={{
                        width: '40px', height: '40px', display: 'grid', placeItems: 'center',
                        borderRadius: 'var(--radius)', border: 'none',
                        backgroundColor: joinCode.trim() ? 'var(--primary)' : 'var(--muted)',
                        color: joinCode.trim() ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                        cursor: joinCode.trim() ? 'pointer' : 'not-allowed', flexShrink: 0,
                        transition: 'background 0.15s',
                      }}
                    >
                      <ArrowUpRightIcon />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Recent meetings */}
            <section style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent meetings</h2>
                  <p style={{ marginTop: '4px', fontSize: '14px', color: 'var(--muted-foreground)' }}>Your conversations, all in one place.</p>
                </div>
                <span style={{ flexShrink: 0, borderRadius: '9999px', border: '1px solid var(--border)', padding: '4px 10px', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)' }}>
                  0 meetings
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)', padding: '2.5rem 1.25rem', textAlign: 'center', gap: '8px' }}>
                <span style={{ display: 'grid', width: '44px', height: '44px', placeItems: 'center', borderRadius: '50%', backgroundColor: 'var(--icon-wash)', color: 'var(--brand)' }}>
                  <CalendarIcon />
                </span>
                <p style={{ marginTop: '8px', fontSize: '14px', fontWeight: 500 }}>Your meeting history will live here</p>
                <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', maxWidth: '340px', lineHeight: 1.6, margin: 0 }}>
                  Start a meeting and the important moments will be easy to find.
                </p>
              </div>
            </section>
          </div>

          {/* ── Right sidebar ── */}
          <aside>
            <div className="gsap-card" style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-panel)', overflow: 'hidden' }}>
              <div style={{ borderBottom: '1px solid var(--border)', padding: '1rem 1.5rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '15px', margin: 0 }}>A little more focus</h2>
                <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--muted-foreground)' }}>Everything you need to keep moving.</p>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {moments.map(({ title, icon: Icon, description }, i) => (
                  <li key={title} style={{ display: 'flex', gap: '14px', padding: '1.1rem 1.5rem', borderBottom: i < moments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ display: 'grid', width: '36px', height: '36px', placeItems: 'center', borderRadius: '8px', backgroundColor: 'var(--icon-wash)', color: 'var(--brand)', flexShrink: 0 }}>
                      <Icon />
                    </span>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{title}</h3>
                      <p style={{ marginTop: '4px', fontSize: '12px', lineHeight: 1.6, color: 'var(--muted-foreground)', margin: '4px 0 0' }}>{description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--note)', padding: '12px 1.5rem', fontSize: '12px', color: 'var(--note-foreground)' }}>
                <span style={{ color: 'var(--brand)', flexShrink: 0 }}><ShieldIcon /></span>
                <span>Your conversations stay yours.</span>
              </div>
            </div>

            <div className="gsap-card" style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '0 4px' }}>
              <span style={{ marginTop: '2px', display: 'grid', width: '32px', height: '32px', placeItems: 'center', borderRadius: '8px', backgroundColor: 'var(--highlight-wash)', color: 'var(--highlight)', flexShrink: 0 }}>
                <MicIcon />
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>A better meeting starts here.</p>
                <p style={{ marginTop: '4px', fontSize: '12px', lineHeight: 1.6, color: 'var(--muted-foreground)', margin: '4px 0 0' }}>Bring your people. We'll help with the details.</p>
              </div>
              <span style={{ marginTop: '4px', flexShrink: 0, color: 'var(--muted-foreground)' }}><ArrowDownRightIcon /></span>
            </div>
          </aside>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ margin: '0 auto', display: 'flex', maxWidth: '1320px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '1.25rem 2.5rem', fontSize: '12px', color: 'var(--muted-foreground)' }}>
          <span style={{ fontWeight: 500 }}>Meeting Copilot</span>
          <span>More present. Less catching up.</span>
        </div>
      </footer>

      {/* ── Start Meeting Dialog ──────────────────────────────────────────── */}
      {dialog && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setDialog(null); }}
        >
          <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'calc(var(--radius) + 2px)', padding: '1.75rem', width: '100%', maxWidth: '28rem', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', position: 'relative' }}>
            {/* Close button */}
            <button
              onClick={() => setDialog(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'grid', placeItems: 'center', width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', transition: 'background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--muted)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
            >
              <XIcon />
            </button>

            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{dialog.title}</h2>
            <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', lineHeight: 1.6, marginBottom: dialog.code ? '1.25rem' : '0' }}>{dialog.message}</p>

            {dialog.code && (
              <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--note)', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: '8px' }}>Room Code</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--foreground)' }}>{dialog.code}</span>
                  <button
                    onClick={copyCode}
                    aria-label={copied ? 'Room code copied' : 'Copy room code'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '6px 14px', borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)', backgroundColor: 'var(--background)',
                      color: 'var(--foreground)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--muted)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--background)'; }}
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleEnterRoom}
                style={{
                  flex: 1, height: '42px', borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)',
                  border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  transition: 'filter 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
              >
                Enter Room
              </button>
              <button
                onClick={() => setDialog(null)}
                style={{
                  height: '42px', padding: '0 20px', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', backgroundColor: 'var(--background)',
                  color: 'var(--foreground)', fontWeight: 500, fontSize: '14px', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--muted)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--background)'; }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
