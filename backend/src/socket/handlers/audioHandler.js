console.log('ASSEMBLYAI KEY in audioHandler:', process.env.ASSEMBLYAI_API_KEY ? 'FOUND' : 'MISSING')
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { createRealtimeTranscriber } from '../../services/ai/assemblyService.js';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const activeTranscribers = new Map();

export default function audioHandler(io, socket) {
  socket.on('start-transcription', async ({ roomCode, userId, userName }) => {
    try {
      const transcriber = createRealtimeTranscriber(
        async (text, end_of_turn, turn_order) => {
          try {
            const meeting = await prisma.meeting.findUnique({
              where: { roomCode }
            });

            if (!meeting) return;

            const now = Date.now() / 1000;
            await prisma.transcript.create({
              data: {
                meetingId: meeting.id,
                speakerName: userName,
                speakerId: userId,
                text,
                startSec: now,
                endSec: now + 1,
                isFinal: true
              }
            });

            io.to(roomCode).emit('transcript-update', {
              userId,
              userName,
              text,
              end_of_turn,
              turn_order
            });
          } catch (err) {
            console.error('Error in onTranscript callback:', err);
          }
        },
        (error) => {
          console.error('AssemblyAI Transcriber Error:', error);
        }
      );

      console.log('Attempting to connect transcriber...')
      console.log('API Key:', process.env.ASSEMBLYAI_API_KEY?.slice(0, 8) + '...')

      await transcriber.connect();
      activeTranscribers.set(socket.id, transcriber);
      socket.emit('transcription-ready');
    } catch (error) {
      console.error('Error starting transcription:', error);
    }
  });

  socket.on('audio-chunk', async ({ audioChunk }) => {
    try {
      const transcriber = activeTranscribers.get(socket.id);
      if (!transcriber) return;

      const buffer = Buffer.from(audioChunk, 'base64');
      transcriber.sendAudio(buffer);
    } catch (error) {
      console.error('Error processing audio chunk:', error);
    }
  });

  socket.on('stop-transcription', async () => {
    try {
      const transcriber = activeTranscribers.get(socket.id);
      if (transcriber) {
        await transcriber.close();
        activeTranscribers.delete(socket.id);
      }
    } catch (error) {
      console.error('Error stopping transcription:', error);
    }
  });

  socket.on('disconnect', async () => {
    try {
      const transcriber = activeTranscribers.get(socket.id);
      if (transcriber) {
        await transcriber.close();
        activeTranscribers.delete(socket.id);
      }
    } catch (error) {
      console.error('Error on disconnect transcription cleanup:', error);
    }
  });
}
