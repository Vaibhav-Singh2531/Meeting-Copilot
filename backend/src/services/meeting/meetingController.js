import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

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

    const updatedMeeting = await prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        status: 'PROCESSING',
        endedAt: new Date()
      }
    });

    res.json(updatedMeeting);
  } catch (error) {
    console.error('End Meeting Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
