import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';

export default function Room() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { users, socket } = useSocket({ roomCode, user });

  const handleLeave = () => {
    if (socket) {
      socket.emit('leave-room', { roomCode, userId: user.id });
      socket.disconnect();
    }
    navigate('/dashboard');
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-800">
          Room: <span className="text-blue-600">{roomCode}</span>
        </h1>
        <button
          onClick={handleLeave}
          className="rounded-lg bg-red-50 px-4 py-2 font-semibold text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Leave Meeting
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-xl font-semibold text-gray-700">Participants ({users.length})</h2>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {users.map((u) => (
              <div
                key={u.userId}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600 shadow-inner">
                  {u.userName?.charAt(0).toUpperCase()}
                </div>
                <p className="w-full truncate text-center font-medium text-gray-800">
                  {u.userName} {u.userId === user.id && <span className="text-gray-400 font-normal">(You)</span>}
                </p>
              </div>
            ))}
          </div>
          
          {users.length === 1 && (
            <div className="mt-12 flex flex-col items-center justify-center text-center">
              <div className="mb-4 text-4xl">👋</div>
              <p className="text-lg font-medium text-gray-600">You're the only one here.</p>
              <p className="text-gray-500">Share the room code <span className="font-bold text-gray-700">{roomCode}</span> to invite others.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
