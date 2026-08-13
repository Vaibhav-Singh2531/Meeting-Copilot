import { PrismaClient } from '@prisma/client';
import { getCache } from '../../cache/cacheService.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import postMeetingQueue from '../../jobs/queue.js';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${result.slice(0, 3)}-${result.slice(3, 6)}`;
};

export const createMeeting = async (req, res) => {
  try {
    const { title } = req.body;
    let roomCode = generateRoomCode();

    // Ensure room code is unique
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.meeting.findUnique({ where: { roomCode } });
      if (!existing) {
        isUnique = true;
      } else {
        roomCode = generateRoomCode();
      }
    }

    const meeting = await prisma.meeting.create({
      data: {
        hostId: req.userId,
        roomCode,
        title: title || 'Untitled Meeting',
        status: 'WAITING',
        participants: {
          create: {
            userId: req.userId,
            role: 'HOST'
          }
        }
      }
    });

    res.status(201).json(meeting);
  } catch (error) {
    console.error('Create Meeting Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMeeting = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const meeting = await prisma.meeting.findUnique({
      where: { roomCode },
      include: {
        participants: {
          include: {
            user: {
              select: {
                name: true,
                avatarUrl: true
              }
            }
          }
        },
        actionItems: {
          select: { title: true, assigneeName: true, priority: true }
        }
      }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const cacheKey = `summary:${meeting.id}`;
    const cachedSummary = await getCache(cacheKey);

    if (cachedSummary) {
      console.log(`Cache hit for summary: ${meeting.id}`);
      return res.json({ ...meeting, finalSummary: cachedSummary });
    }

    console.log(`Cache miss for summary: ${meeting.id}`);
    res.json(meeting);
  } catch (error) {
    console.error('Get Meeting Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const endMeeting = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { roomCode }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.hostId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to end this meeting' });
    }

    const startTime = meeting.startedAt || meeting.createdAt
    const endTime = new Date()
    const durationSec = Math.round((endTime - startTime) / 1000)

    await prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        status: 'PROCESSING',
        endedAt: endTime,
        durationSec: durationSec
      }
    });

    const transcript = req.body.transcript;

    if (transcript && transcript.trim().length > 0) {
      await postMeetingQueue.add('post-meeting', {
        meetingId: meeting.id,
        transcript
      });
    } else {
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { status: 'DONE' }
      });
    }

    res.json({ status: "PROCESSING", meetingId: meeting.id, roomCode });
  } catch (error) {
    console.error('End Meeting Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMeetingTranscripts = async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const meeting = await prisma.meeting.findUnique({
      where: { roomCode }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const transcripts = await prisma.transcript.findMany({
      where: { meetingId: meeting.id },
      select: { speakerName: true, text: true, startSec: true },
      orderBy: { startSec: 'asc' }
    });

    res.json(transcripts);
  } catch (error) {
    console.error('Get Transcripts Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
