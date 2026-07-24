import { useState, useRef, useEffect } from 'react';

export default function useAudioCapture({ socket, roomCode, user }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      if (!socket || !roomCode || !user) {
        console.warn('Socket, roomCode, or user is missing. Cannot start recording.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const options = MediaRecorder.isTypeSupported('audio/webm')
        ? { mimeType: 'audio/webm' }
        : undefined;

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      let headerChunk = null  // ← add this
      let isFirstChunk = true // ← add this

      mediaRecorder.ondataavailable = (e) => {
        if (!e.data || e.data.size === 0) return;

        // ← save first chunk as header
        if (isFirstChunk) {
          headerChunk = e.data
          isFirstChunk = false
        }

        // ← prepend header to every chunk to make it valid webm
        const validBlob = headerChunk
          ? new Blob([headerChunk, e.data], { type: 'audio/webm' })
          : new Blob([e.data], { type: 'audio/webm' })

        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const base64String = reader.result.split(',')[1];
            if (base64String && socket) {
              socket.emit('audio-chunk', {
                roomCode,
                audioChunk: base64String,
                userId: user.id,
                userName: user.name,
                startSec: Date.now() / 1000,
              });
            }
          }
        };
        reader.readAsDataURL(validBlob);
      };

      mediaRecorder.start(3000);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting audio recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
    // We intentionally omit dependencies so this acts as a pure unmount cleanup
    // using the refs directly inside stopRecording.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isRecording, startRecording, stopRecording };
}
