import 'express-async-errors';
import express from 'express';
import { isAuth } from '../middleware/auth.js';
import * as pandoraScreening from '../middleware/pandoraScreening.js';
import * as dashboardController from '../controller/dashboard.js';

const router = express.Router();

// 내가 만든 판도라에 대한 도전자들의 도전현황을 반환한다.
router.get('/pandora/:id/log', isAuth, pandoraScreening.validateIsMyPandora, dashboardController.getMyPandoraLog);

// 내가 도전중인 challenges를 페이지 단위로 반환한다
router.get('/challenges', isAuth, dashboardController.getMyChallenges);

// 내가 풀이를 완료한 판도라를 페이지 단위로 반환한다
router.get('/conquered', isAuth, dashboardController.getMyConqueredPandoras);

export default router;
