import { createKeyGenerator, createRateLimiter } from "../rateLimit.js";

export const readMyPandoraLog = createRateLimiter(
  1 * 60 * 1000, 
  50, 
  createKeyGenerator('log')
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
