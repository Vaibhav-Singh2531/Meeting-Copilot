import { useState, useRef, useEffect } from 'react';

export default function useAudioCapture({ socket, roomCode, user }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleReady = () => {
      setIsReady(true);
      startMicCapture();
    };

    socket.on('transcription-ready', handleReady);

    return () => {
      socket.off('transcription-ready', handleReady);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const startMicCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      console.log('Mic permission granted')

      const audioContext = new AudioContext({ sampleRate: 16000 })
      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0)

        // Convert Float32 to Int16 PCM
        const pcm = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          pcm[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768))
        }

        // Convert to base64
        const uint8 = new Uint8Array(pcm.buffer)
        let binary = ''
        uint8.forEach(b => binary += String.fromCharCode(b))
        const base64 = btoa(binary)

        console.log('Sending PCM chunk, size:', uint8.length, 'bytes')

        if (socket) {
          socket.emit('audio-chunk', { audioChunk: base64 })
        }
      }

      source.connect(processor)
      processor.connect(audioContext.destination)

      // Store cleanup function in ref instead of MediaRecorder
      mediaRecorderRef.current = {
        stop: () => {
          processor.disconnect()
          source.disconnect()
          audioContext.close()
          stream.getTracks().forEach(t => t.stop())
        },
        state: 'recording'
      }

      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setIsReady(false)
    }
  }

  const startRecording = () => {
    if (!socket || !roomCode || !user) return;
    socket.emit('start-transcription', { roomCode, userId: user.id, userName: user.name });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (socket) {
      socket.emit('stop-transcription')
    }

    setIsRecording(false)
    setIsReady(false)
  }

  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  return { isRecording, isReady, startRecording, stopRecording };
}
