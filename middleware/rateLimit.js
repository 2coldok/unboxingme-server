import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { connectRedisDB } from '../database/redis.js';
import { failResponse } from '../response/response.js';

const redisClient = await connectRedisDB();

export const createRateLimiter = (windowMs, limit, keyGeneratorCallback) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args)
    }),
    windowMs: windowMs,
    limit: limit,
    keyGenerator: keyGeneratorCallback,
    handler: (req, res, next, options) => {
      const message = options.message || '잠시 후 다시 시도해주세요.';
      return failResponse(res, 429, null, message);
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

export const createKeyGenerator = (apiCategory) => {
  return (req) => {
    const redisKey = req.guestId || req.googleId;
  
    if (!redisKey) {
      throw new Error('key값을 알 수 없습니다.');
    }

    return `${redisKey}-${apiCategory}`;
  }
};
