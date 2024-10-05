import { createClient } from 'redis';
import { env } from '../config/env.js';

const redisClient = createClient({
  password: env.db.redisPassword,
  socket: {
    host: env.db.redisHost,
    port: env.db.redisPort,
    reconnectStrategy: (retries) => {
      console.log(`redis 연결 재시도중... 재시도 횟수: ${retries}회 `);
      if (retries > 10) {
        return new Error('redis 재열결 시도 10회 초과');
      }
      return Math.min(retries * 100, 5000);
    }
  }
});

redisClient.on('error', (err) => {
  console.error('Redis 에러 발생:', err);
});

redisClient.on('ready', () => {
  console.log('Redis 클라이언트 준비 완료');
});

redisClient.on('end', () => {
  console.log('Redis 연결이 종료되었습니다.');
});

redisClient.on('reconnecting', (attempt) => {
  console.log(`Redis 재연결 시도 중, 시도 횟수: ${attempt}`);
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
