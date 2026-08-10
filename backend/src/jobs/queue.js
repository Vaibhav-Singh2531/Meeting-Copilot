import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

console.log('REDIS_URL in queue.js:', process.env.REDIS_URL ? 'FOUND' : 'MISSING')

export const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: {}
});

const postMeetingQueue = new Queue('post-meeting', { connection: redisConnection });

export default postMeetingQueue;
