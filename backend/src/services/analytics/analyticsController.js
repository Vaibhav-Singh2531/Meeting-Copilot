import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.userId;

    const hostedCount = await prisma.meeting.count({
      where: { hostId: userId }
    });

    const participatedCount = await prisma.participant.count({
      where: { userId }
    });

    const participatedMeetings = await prisma.meeting.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    const totalMeetings = participatedMeetings.length;

    let totalMinutes = 0;
    let meetingsWithDuration = 0;

    for (const m of participatedMeetings) {
      if (m.startedAt && m.endedAt) {
        const duration = (m.endedAt.getTime() - m.startedAt.getTime()) / 60000;
        totalMinutes += duration;
        meetingsWithDuration++;
      }
    }

    const avgDurationMinutes = meetingsWithDuration > 0 
      ? Math.round((totalMinutes / meetingsWithDuration) * 10) / 10 
      : 0;

    totalMinutes = Math.round(totalMinutes);

    const transcripts = await prisma.transcript.findMany({
      where: {
        meeting: {
          participants: {
            some: { userId }
          }
        }
      },
      select: { speakerName: true, text: true }
    });

    const speakerCounts = {};
    for (const t of transcripts) {
      const words = t.text ? t.text.trim().split(/\s+/).length : 0;
      if (!speakerCounts[t.speakerName]) {
        speakerCounts[t.speakerName] = 0;
      }
      speakerCounts[t.speakerName] += words;
    }

    const topSpeakers = Object.entries(speakerCounts)
      .map(([speakerName, wordCount]) => ({ speakerName, wordCount }))
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 5);

    const meetingFrequency = [];
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now.getTime() - (i * 7 + 7) * 24 * 60 * 60 * 1000);
      const end = new Date(now.getTime() - (i * 7) * 24 * 60 * 60 * 1000);
      const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const count = participatedMeetings.filter(m => m.createdAt >= start && m.createdAt < end).length;
      meetingFrequency.push({ week: label, count });
    }

    const recentMeetings = participatedMeetings
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(m => ({
        title: m.title,
        createdAt: m.createdAt,
        endedAt: m.endedAt,
        startedAt: m.startedAt,
        roomCode: m.roomCode,
        participantCount: m._count.participants
      }));

    res.json({
      hostedCount,
      participatedCount,
      totalMeetings,
      totalMinutes,
      avgDurationMinutes,
      topSpeakers,
      meetingFrequency,
      recentMeetings
    });
    
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
