import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{ borderBottom: '1px solid var(--topbar-border)', backgroundColor: 'var(--topbar)', color: 'var(--topbar-foreground)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ margin: '0 auto', display: 'grid', minHeight: '76px', width: '100%', maxWidth: '1320px', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', padding: '0 2.5rem' }}>

        {/* Logo */}
        <Link
          to="/dashboard"
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', minWidth: 0 }}
        >
          <span style={{ display: 'grid', width: '40px', height: '40px', flexShrink: 0, placeItems: 'center', borderRadius: '8px', backgroundColor: 'var(--brand-mark)', color: 'var(--brand-mark-foreground)' }}>
            {/* Waves icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
              <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
              <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
            </svg>
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--topbar-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Meeting Copilot
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link
            to="/dashboard"
            style={{
              padding: '6px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'background 0.15s',
              backgroundColor: isActive('/dashboard') ? 'var(--topbar-selected)' : 'transparent',
              color: isActive('/dashboard') ? 'var(--topbar-selected-foreground)' : 'var(--topbar-muted)',
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/analytics"
            style={{
              padding: '6px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'background 0.15s',
              backgroundColor: isActive('/analytics') ? 'var(--topbar-selected)' : 'transparent',
              color: isActive('/analytics') ? 'var(--topbar-selected-foreground)' : 'var(--topbar-muted)',
            }}
          >
            Analytics
          </Link>
        </nav>

        {/* User area */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <span style={{ display: 'grid', width: '36px', height: '36px', placeItems: 'center', borderRadius: '50%', backgroundColor: 'var(--avatar)', color: 'var(--avatar-foreground)', fontSize: '14px', fontWeight: 600, flexShrink: 0 }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
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
  );
}
