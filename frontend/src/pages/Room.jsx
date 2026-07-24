import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import useAudioCapture from '../hooks/useAudioCapture';

export default function Room() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { users, socket, isConnected } = useSocket({ roomCode, user });
  const { isRecording, startRecording, stopRecording } = useAudioCapture({ socket, roomCode, user });

  const [transcripts, setTranscripts] = useState([]);
  const transcriptEndRef = useRef(null);

  // Listen for transcript updates from the socket
  useEffect(() => {
    if (!socket) return;

    const handleTranscript = (data) => {
      // console.log('Transcript received on frontend:', data)
      setTranscripts(prev => [...prev, data]);
    };

    socket.on('transcript-update', handleTranscript);

    return () => {
      socket.off('transcript-update', handleTranscript);
    };
  }, [socket]);

  // Auto-scroll to the bottom when new transcripts arrive
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts]);

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

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {isRecording && (
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
              </span>
            )}
            <button
              disabled={!isConnected}
              onClick={isRecording ? stopRecording : startRecording}
              className={`rounded-lg px-4 py-2 font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isRecording
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
                : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                } disabled:opacity-50`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          </div>

          <button
            onClick={handleLeave}
            className="rounded-lg bg-red-50 px-4 py-2 font-semibold text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Leave Meeting
          </button>
        </div>
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
            <div className="mt-8 flex flex-col items-center justify-center text-center">
              <p className="text-lg font-medium text-gray-600">You're the only one here.</p>
              <p className="text-gray-500">Share the room code <span className="font-bold text-gray-700">{roomCode}</span> to invite others.</p>
            </div>
          )}

          <div className="mt-10">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">Live Transcript</h2>
            <div className="flex h-72 flex-col overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              {transcripts.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                  <p>No transcripts yet.</p>
                  <p className="text-sm">Click "Start Recording" to begin speaking.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transcripts.map((t, i) => (
                    <div key={i} className="text-gray-800 text-lg">
                      <span className="font-bold text-blue-600 mr-2">{t.userName}:</span>
                      <span>{t.text}</span>
                    </div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
