import { createClient } from 'redis';
import { env } from '../config/env.js';

const redisClient = createClient({
  password: env.db.redisPassword,
  socket: {
    host: env.db.redisHost,
    port: env.db.redisPort
  }
});

export async function connectRedisDB() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('RedisDB 연결 성공');
    }
    return redisClient;
  } catch (error) {
    console.error('Redis 연결 실패:', error);
    throw error;
  }
}
