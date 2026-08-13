import { redisConnection } from '../jobs/queue.js';

export const getCache = async (key) => {
  try {
    const result = await redisConnection.get(key);
    if (result === null) {
      return null;
    }
    return JSON.parse(result);
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
};

export const setCache = async (key, value, ttlSeconds = 300) => {
  try {
    const serialised = JSON.stringify(value);
    if (ttlSeconds === 0) {
      await redisConnection.set(key, serialised);
    } else {
      await redisConnection.set(key, serialised, 'EX', ttlSeconds);
    }
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
  }
};

export const deleteCache = async (key) => {
  try {
    await redisConnection.del(key);
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
  }
};
