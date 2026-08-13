import React, { useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function Login() {
  const { user } = useAuth();
  const containerRef = useRef();

  useGSAP(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4 }
    );

    gsap.fromTo(
      '.gsap-title',
      { opacity: 0, y: -40, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
    );

    gsap.fromTo(
      '.gsap-tagline',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: 'power2.out' }
    );

    gsap.fromTo(
      '.gsap-button',
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: 0.6, ease: 'back.out(1.7)' }
    );

    const button = containerRef.current.querySelector('.gsap-button');
    if (button) {
      const onEnter = () => gsap.to(button, { scale: 1.05, duration: 0.2 });
      const onLeave = () => gsap.to(button, { scale: 1, duration: 0.2 });

      button.addEventListener('mouseenter', onEnter);
      button.addEventListener('mouseleave', onLeave);

      return () => {
        button.removeEventListener('mouseenter', onEnter);
        button.removeEventListener('mouseleave', onLeave);
      };
    }
  }, { scope: containerRef });

  // If already authenticated, bypass login
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div ref={containerRef} className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <h1 className="gsap-title mb-2 text-4xl font-extrabold tracking-tight text-gray-900">Meeting Copilot</h1>
        <p className="gsap-tagline mb-8 text-lg text-gray-500">Your intelligent meeting assistant.</p>
        
        <a 
          href="http://localhost:5000/api/auth/google/redirect"
          className="gsap-button inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google logo" 
            className="mr-3 h-5 w-5" 
          />
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
