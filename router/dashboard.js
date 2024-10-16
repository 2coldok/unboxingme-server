import 'express-async-errors';
import express from 'express';
import { isAuth } from '../middleware/auth.js';
import * as pandoraScreening from '../middleware/pandoraScreening.js';
import * as dashboardController from '../controller/dashboard.js';
import { validateUUIDV4 } from '../middleware/validator/uuidv4.js';
import { validatePage } from '../middleware/validator/page.js';
import * as dashboardRateLimter from '../middleware/ratelimit/dashboard.js';

const router = express.Router();

// 내가 만든 판도라 세부정보, top도전자 현황을 반환한다.
router.get(
  '/pandora/:id', 
  isAuth, 
  dashboardRateLimter.readMyPandoraDetail,
  validateUUIDV4,
  pandoraScreening.validateIsMyPandora, 
  dashboardController.getMyPandoraDetail
);

// 내가 도전중인 challenges를 최근 10개만 반환한다
router.get(
  '/challenges', 
  isAuth, 
  dashboardRateLimter.readMyChallenges,
  dashboardController.getMyChallenges
);

// 내가 풀이를 완료한 판도라들을 반환한다
router.get(
  '/conquered', 
  isAuth, 
  dashboardRateLimter.readMyConquered,
  validatePage,
  dashboardController.getMyConqueredPandoras
);

export default router;
