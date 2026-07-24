import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { transcribeAudio } from '../../services/ai/whisperService.js';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default function audioHandler(io, socket) {
  socket.on('audio-chunk', async ({ roomCode, audioChunk, userId, userName, startSec }) => {
    try {
      if (!audioChunk) return;

      const buffer = Buffer.from(audioChunk, 'base64');
      const text = await transcribeAudio(buffer);

      if (!text || !text.trim()) {
        return;
      }

      const meeting = await prisma.meeting.findUnique({
        where: { roomCode }
      });

      if (!meeting) {
        console.error(`audioHandler: Meeting not found for roomCode ${roomCode}`);
        return;
      }

      const computedStartSec = startSec || 0;
      const computedEndSec = computedStartSec + 3;
      const finalString = text.trim();

      await prisma.transcript.create({
        data: {
          meetingId: meeting.id,
          speakerName: userName,
          speakerId: userId,
          text: finalString,
          startSec: computedStartSec,
          endSec: computedEndSec,
          isFinal: true
        }
      });

      io.to(roomCode).emit('transcript-update', {
        userId,
        userName,
        text: finalString,
        startSec: computedStartSec
      });

    } catch (error) {
      console.error('Error handling audio chunk:', error);
    }
  });
}
