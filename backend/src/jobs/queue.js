import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

export const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: {}
});

const postMeetingQueue = new Queue('post-meeting', { connection: redisConnection });

export default postMeetingQueue;
