import { Worker } from 'bullmq';
import { redisConnection } from './queue.js';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { generateFinalSummary, extractActionItems } from '../services/ai/summaryService.js';
import { upsertMeetingEmbedding } from '../services/ai/embeddingService.js';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const postMeetingWorker = new Worker(
  'post-meeting',
  async (job) => {
    const { meetingId, transcript } = job.data;

    try {
      if (!transcript || transcript.trim() === '') {
        await prisma.meeting.update({
          where: { id: meetingId },
          data: { status: 'DONE' }
        });
        return;
      }

      const finalSummary = await generateFinalSummary(transcript);
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { finalSummary }
      });

      const actionItems = await extractActionItems(transcript);

      for (const item of actionItems) {
        await prisma.actionItem.create({
          data: {
            meetingId,
            title: item.title,
            assigneeName: item.assigneeName,
            priority: item.priority,
            dueDate: null
          }
        });
      }

      try {
        const meeting = await prisma.meeting.findUnique({
          where: { id: meetingId }
        });

        if (meeting) {
          await upsertMeetingEmbedding({
            meetingId,
            roomCode: meeting.roomCode,
            title: meeting.title,
            date: meeting.createdAt.toISOString(),
            transcript
          });
        }
      } catch (embError) {
        console.error('Embedding step failed but continuing:', embError);
      }

      await prisma.meeting.update({
        where: { id: meetingId },
        data: { status: 'DONE' }
      });

    } catch (error) {
      console.error('Error processing post-meeting job:', error);
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { status: 'FAILED' }
      });
    }
  },
  { connection: redisConnection }
);
console.log('Bull worker started, listening for jobs...')

postMeetingWorker.on('completed', (job) => {
  console.log('Job completed:', job.id)
})

postMeetingWorker.on('failed', (job, err) => {
  console.error('Job failed:', job.id, err.message)
})

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err.message)
})

redisConnection.on('connect', () => {
  console.log('Redis connected successfully')
})

export default postMeetingWorker;
