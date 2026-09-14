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
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-800/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        
        {/* Left side: App name */}
        <Link 
          to="/dashboard" 
          className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-xl font-bold text-transparent"
        >
          Meeting Copilot
        </Link>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center space-x-2">
          <Link
            to="/dashboard"
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isActive('/dashboard') 
                ? 'bg-white/10 text-white' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/analytics"
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isActive('/analytics') 
                ? 'bg-white/10 text-white' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            Analytics
          </Link>
        </div>

        {/* Right side: User Profile & Logout */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <span className="hidden sm:block text-sm text-slate-300">
              {user?.name}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-1 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            Logout
          </button>
        </div>
        
      </div>
    </nav>
  );
}
