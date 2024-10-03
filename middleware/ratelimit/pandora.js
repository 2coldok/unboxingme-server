// import { rateLimit } from 'express-rate-limit';
// import RedisStore from 'rate-limit-redis';
// import { failResponse } from '../../response/response.js';
// import { connectRedisDB } from '../../database/redis.js';

import { createKeyGenerator, createRateLimiter } from "../rateLimit.js";

// const redisClient = await connectRedisDB();


// export const readSearchResult = rateLimit({
//   store: new RedisStore({
//     sendCommand: (...args) => redisClient.sendCommand(args)
//   }),
//   keyGenerator: (req) => {
//     const guestId = req.guestId;
//     console.log('search---')
//     console.log(req.guestId);
//     console.log('--------')
//     if (!guestId) {
//       throw new Error('[알 수 없는 오류] guest ID를 전달받지 못했습니다.');
//     }
//     return `${guestId}-search`;
//   },
//   windowMs: 3 * 60 * 1000,
//   limit: 60,
//   handler: (req, res, next, options) => {
//     const message = options.message || '검색 요청 횟수가 초과되었습니다. 잠시후 다시 시도해주세요';
//     return failResponse(res, 429, null, message);
//   },
//   standardHeaders: true,
//   legacyHeaders: false
// });


// export const readPandoraCover = rateLimit({
//   store: new RedisStore({
//     sendCommand: (...args) => redisClient.sendCommand(args)
//   }),
//   keyGenerator: (req) => {
//     console.log('cover---')
//     console.log(req.guestId);
//     console.log('--------')
//     const guestId = req.guestId;
//     if (!guestId) {
//       throw new Error('[알 수 없는 오류] guest ID를 전달받지 못했습니다.');
//     }
//     return `${guestId}-cover`;
//   },
//   windowMs: 3 * 60 * 1000,
//   limit: 50,
//   handler: (req, res, next, options) => {
//     const message = options.message || '판도라 표지 요청 횟수가 초과되었습니다. 잠시후 다시 시도해주세요';
//     return failResponse(res, 429, null, message);
//   },
//   standardHeaders: true,
//   legacyHeaders: false
// });


// export const createMyPandora = rateLimit({
//   store: new RedisStore({
//     sendCommand: (...args) => redisClient.sendCommand(args)
//   }),
//   windowMs: 30 * 60 * 1000,
//   limit: 10,
//   keyGenerator: (req) => {
//     if (!req.googleId) {
//       throw new Error('[알 수 없는 오류] 구글 아이디가 존재하지 않습니다.');
//     }
//     return `${req.googleId}-create`
//   },
//   handler: (req, res, next, options) => {
//     const message = options.message || '잠시 후 다시 시도해주세요';
//     return failResponse(res, 429, null, message);
//   }
// });


// export const editMyPandora = rateLimit({
//   store: new RedisStore({
//     sendCommand: (...args) => redisClient.sendCommand(args)
//   }),
//   windowMs: 30 * 60 * 1000,
//   limit: 10,
//   keyGenerator: (req) => {
//     if (!req.googleId) {
//       throw new Error('[알 수 없는 오류] 구글 아이디가 존재하지 않습니다.');
//     }
//     return `${req.googleId}-edit`
//   },
//   handler: (req, res, next, options) => {
//     const message = options.message || '잠시 후 다시 시도해주세요.';
//     return failResponse(res, 429, null, message);
//   }
// });


// export const deleteMyPandora = rateLimit({
//   store: new RedisStore({
//     sendCommand: (...args) => redisClient.sendCommand(args)
//   }),
//   windowMs: 1 * 60 * 1000,
//   limit: 30,
//   keyGenerator: (req) => {
//     if (!req.googleId) {
//       throw new Error('[알 수 없는 오류] 구글 아이디가 존재하지 않습니다.');
//     }
//     return `${req.googleId}-delete`;
//   },
//   handler: (req, res, next, options) => {
//     const message = options.message || '잠시 후 다시 시도해주세요.';
//     return failResponse(res, 429, null, message);
//   }
// });

// export const readMyPandoras = rateLimit({
//   store: new RedisStore({
//     sendCommand: (...args) => redisClient.sendCommand(args)
//   }),
//   windowMs: 5 * 60 * 1000,
//   limit: 50,
//   keyGenerator: (req) => {
//     if (!req.googleId) {
//       throw new Error('[알 수 없는 오류] 구글 아이디가 존재하지 않습니다.');
//     }
//     return `${req.googleId}-mines`;
//   },
//   handler: (req, res, next, options) => {
//     const message = options.message || '잠시 후 다시 시도해주세요.';
//     return failResponse(res, 429, null, message);
//   }
// });

// export const readMyPandoraForEdit = rateLimit({
//   store: new RedisStore({
//     sendCommand: (...args) => redisClient.sendCommand(args)
//   }),
//   windowMs: 5 * 60 * 1000,
//   limit: 30,
//   keyGenerator: (req) => {
//     if (!req.googleId) {
//       throw new Error('[알 수 없는 오류] 구글 아이디가 존재하지 않습니다.');
//     }
//     return `${req.googleId}-mine`;
//   },
//   handler: (req, res, next, options) => {
//     const message = options.message || '잠시 후 다시 시도해주세요.';
//     return failResponse(res, 429, null, message);
//   }
// });

export const readSearchResult = createRateLimiter(
  3 * 60 * 1000, 
  60, 
  createKeyGenerator('search')
);

export const readPandoraCover = createRateLimiter(
  3 * 60 * 1000, 
  50, 
  createKeyGenerator('cover')
);

export const createMyPandora = createRateLimiter(
  30 * 60 * 1000, 
  10, 
  createKeyGenerator('create')
);

export const editMyPandora = createRateLimiter(
  30 * 60 * 1000, 
  10, 
  createKeyGenerator('edit')
);

export const deleteMyPandora = createRateLimiter(
  1 * 60 * 1000, 
  30, 
  createKeyGenerator('delete')
);

export const readMyPandoras = createRateLimiter(
  5 * 60 * 1000, 
  50, 
  createKeyGenerator('mines')
);

export const readMyPandoraForEdit = createRateLimiter(
  5 * 60 * 1000,
  30, 
  createKeyGenerator('mine')
);
