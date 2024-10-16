import { createKeyGenerator, createRateLimiter } from "../rateLimit.js";

export const readMyPandoraDetail = createRateLimiter(
  1 * 60 * 1000, 
  50, 
  createKeyGenerator('detail')
);

export const readMyChallenges = createRateLimiter(
  1 * 60 * 1000, 
  50, 
  createKeyGenerator('challenges')
);

export const readMyConquered = createRateLimiter(
  1 * 60 * 1000, 
  50, 
  createKeyGenerator('conquered')
);
