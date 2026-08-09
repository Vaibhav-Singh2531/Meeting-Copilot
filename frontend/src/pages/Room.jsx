import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import useAudioCapture from '../hooks/useAudioCapture';
import api from '../lib/api';

export default function Room() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { users, socket, isConnected } = useSocket({ roomCode, user });
  const { isRecording, isReady, startRecording, stopRecording } = useAudioCapture({ socket, roomCode, user });
  const [isStarting, setIsStarting] = useState(false);

  const [finalTranscripts, setFinalTranscripts] = useState([]);
  const [activeTurns, setActiveTurns] = useState({});
  const transcriptEndRef = useRef(null);

  const [summaryText, setSummaryText] = useState('');
  const [isSummarising, setIsSummarising] = useState(false);
  const [summaryInterval, setSummaryInterval] = useState(2);
  const lastSummarisedIndexRef = useRef(0);

  // New state variables for End Meeting workflow
  const [meetingHostId, setMeetingHostId] = useState(null);
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [finalSummary, setFinalSummary] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    if (isReady) {
      setIsStarting(false);
    }
  }, [isReady]);

  // Fetch meeting host id on mount
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const response = await api.get(`/meetings/${roomCode}`);
        setMeetingHostId(response.data.hostId);
      } catch (error) {
        console.error('Error fetching meeting:', error);
      }
    };
    if (roomCode) {
      fetchMeeting();
    }
  }, [roomCode]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Listen for socket updates
  useEffect(() => {
    if (!socket) return;

    const handleTranscript = (data) => {
      const turnKey = `${data.userId}-${data.turn_order}`;
      if (data.end_of_turn) {
        setFinalTranscripts(prev => [...prev, data]);
        setActiveTurns(prev => {
          const updated = { ...prev };
          delete updated[turnKey];
          return updated;
        });
      } else {
        setActiveTurns(prev => ({
          ...prev,
          [turnKey]: data
        }));
      }
    };

    const handleSummaryChunk = ({ chunk }) => {
      setSummaryText(prev => prev + chunk);
    };

    const handleSummaryDone = () => {
      setIsSummarising(false);
    };

    const handleSummaryError = ({ error }) => {
      console.error('Summary Error:', error);
      setIsSummarising(false);
    };

    socket.on('transcript-update', handleTranscript);
    socket.on('summary-chunk', handleSummaryChunk);
    socket.on('summary-done', handleSummaryDone);
    socket.on('summary-error', handleSummaryError);

    return () => {
      socket.off('transcript-update', handleTranscript);
      socket.off('summary-chunk', handleSummaryChunk);
      socket.off('summary-done', handleSummaryDone);
      socket.off('summary-error', handleSummaryError);
    };
  }, [socket]);

  // Auto-scroll to the bottom when new transcripts arrive
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [finalTranscripts, activeTurns]);

  // Auto-summary interval
  useEffect(() => {
    if (!socket || !roomCode) return;

    const intervalId = setInterval(() => {
      const newEntries = finalTranscripts.slice(lastSummarisedIndexRef.current);
      if (newEntries.length === 0) return;

      const joinedString = newEntries.map(t => `${t.userName}: ${t.text}`).join('\n');
      lastSummarisedIndexRef.current = finalTranscripts.length;

      setSummaryText('');
      setIsSummarising(true);
      socket.emit('request-summary', { roomCode, transcript: joinedString });

    }, summaryInterval * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [socket, roomCode, finalTranscripts, summaryInterval]);

  const handleManualSummary = () => {
    const newEntries = finalTranscripts.slice(lastSummarisedIndexRef.current);
    if (newEntries.length === 0) return;

    const joinedString = newEntries.map(t => `${t.userName}: ${t.text}`).join('\n');
    lastSummarisedIndexRef.current = finalTranscripts.length;

    setSummaryText('');
    setIsSummarising(true);
    socket.emit('request-summary', { roomCode, transcript: joinedString });
  };

  const handleEndMeeting = async () => {
    try {
      setIsEndingMeeting(true);
      const fullTranscript = finalTranscripts.map(t => `${t.userName}: ${t.text}`).join('\n');
      await api.patch(`/meetings/${roomCode}/end`, { transcript: fullTranscript });
      
      setShowEndModal(true);
      setIsProcessing(true);

      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/meetings/${roomCode}`);
          if (res.data.status === 'DONE') {
            clearInterval(pollIntervalRef.current);
            setFinalSummary(res.data.finalSummary);
            setActionItems(res.data.actionItems || []);
            setIsProcessing(false);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error ending meeting:', error);
    } finally {
      setIsEndingMeeting(false);
    }
  };

  const handleLeave = () => {
    if (socket) {
      socket.emit('leave-room', { roomCode, userId: user.id });
      socket.disconnect();
    }
    navigate('/dashboard');
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* End Meeting Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Meeting Ended</h2>
              <button onClick={() => setShowEndModal(false)} className="text-gray-500 hover:text-gray-700 font-bold">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {isProcessing ? (
                <div className="flex h-64 flex-col items-center justify-center space-y-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                  <p className="text-lg font-medium text-gray-600">Processing meeting... please wait</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <section>
                    <h3 className="mb-3 text-lg font-semibold text-gray-800">Final Summary</h3>
                    <div className="rounded-lg bg-gray-50 p-4 text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-200">
                      {finalSummary || "No summary available."}
                    </div>
                  </section>
                  
                  <section>
                    <h3 className="mb-3 text-lg font-semibold text-gray-800">Action Items</h3>
                    {actionItems.length === 0 ? (
                      <p className="text-gray-500">No action items extracted.</p>
                    ) : (
                      <ul className="space-y-3">
                        {actionItems.map((item, idx) => (
                          <li key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800">{item.title}</span>
                              {item.assigneeName && (
                                <span className="text-sm text-gray-500 mt-1">Assignee: {item.assigneeName}</span>
                              )}
                            </div>
                            <div className="mt-2 sm:mt-0">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                                item.priority === 'LOW' ? 'bg-green-100 text-green-700' :
                                item.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                item.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {item.priority}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

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
              disabled={!isConnected || (isStarting && !isReady)}
              onClick={() => {
                if (isRecording) {
                  stopRecording();
                  setIsStarting(false);
                } else {
                  setIsStarting(true);
                  startRecording();
                }
              }}
              className={`rounded-lg px-4 py-2 font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isRecording
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
                : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                } disabled:opacity-50`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          </div>

          <div className="flex space-x-3">
            {user.id === meetingHostId && (
              <button
                disabled={isEndingMeeting}
                onClick={handleEndMeeting}
                className="rounded-lg bg-red-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isEndingMeeting ? 'Ending...' : 'End Meeting'}
              </button>
            )}
            <button
              onClick={handleLeave}
              className="rounded-lg bg-red-50 px-4 py-2 font-semibold text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Leave Meeting
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl pb-12">
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
              {finalTranscripts.length === 0 && Object.keys(activeTurns).length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                  <p>No transcripts yet.</p>
                  <p className="text-sm">Click "Start Recording" to begin speaking.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {finalTranscripts.map((t, i) => (
                    <div key={i} className="text-gray-800 text-lg">
                      <span className="font-bold text-blue-600 mr-2">{t.userName}:</span>
                      <span>{t.text}</span>
                    </div>
                  ))}
                  {Object.entries(activeTurns).map(([key, t]) => (
                    <div key={key} className="text-gray-400 text-lg italic">
                      <span className="font-bold text-blue-300 mr-2">{t.userName}:</span>
                      <span>{t.text}</span>
                    </div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* AI Summary Section */}
          <div className="mt-8 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Auto-summary every:</label>
              <select
                value={summaryInterval}
                onChange={(e) => setSummaryInterval(Number(e.target.value))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={1}>1 minute</option>
                <option value={2}>2 minutes</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
              </select>
            </div>
            <button
              disabled={isSummarising || finalTranscripts.length === 0}
              onClick={handleManualSummary}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Summarise Now
            </button>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-700">AI Summary</h2>
              {isSummarising && (
                <div className="flex items-center space-x-2 rounded-full bg-green-50 px-3 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                  <span className="text-sm font-medium text-green-700">Summarising...</span>
                </div>
              )}
            </div>

            <div className="flex h-64 flex-col overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {!summaryText && !isSummarising && (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                  <p>Summary will appear here after the first interval or click Summarise Now</p>
                </div>
              )}

              {!summaryText && isSummarising && (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                  <p>Generating summary...</p>
                </div>
              )}

              {summaryText && (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {summaryText}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
