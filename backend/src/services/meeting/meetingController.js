import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { generateFinalSummary } from '../ai/summaryService.js';

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
        }
      }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

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

    let updatedMeeting = await prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        status: 'PROCESSING',
        endedAt: new Date()
      }
    });

    const transcripts = await prisma.transcript.findMany({
      where: { meetingId: meeting.id },
      select: { speakerName: true, text: true },
      orderBy: { startSec: 'asc' }
    });

    const fullTranscript = transcripts
      .map((t) => `${t.speakerName}: ${t.text}`)
      .join('\n');

    if (!fullTranscript || fullTranscript.trim().length === 0) {
      updatedMeeting = await prisma.meeting.update({
        where: { id: meeting.id },
        data: { status: 'DONE' }
      });
      return res.json(updatedMeeting);
    }

    try {
      const finalSummary = await generateFinalSummary(fullTranscript);
      updatedMeeting = await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          finalSummary,
          status: 'DONE'
        }
      });
    } catch (summaryError) {
      console.error('Error generating final summary:', summaryError);
      updatedMeeting = await prisma.meeting.update({
        where: { id: meeting.id },
        data: { status: 'DONE' }
      });
    }

    res.json(updatedMeeting);
  } catch (error) {
    console.error('End Meeting Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
