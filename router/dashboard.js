import 'express-async-errors';
import express from 'express';
import { isAuth } from '../middleware/auth.js';
import * as pandoraScreening from '../middleware/pandoraScreening.js';
import * as dashboardController from '../controller/dashboard.js';

const router = express.Router();

// www.riddlenote.com/dashboard/mine/596782f3-4c0b-4dc4-a59b-56ca5d9f0a59/log 에서 사용함
// id는 pandora의 uuid
// 내가 만든 판도라 로그를 반환한다.
router.get('/:id/log', isAuth, pandoraScreening.verifyPandoraMaker, dashboardController.getMyPandoraLog);

// 내가 도전중인 판도라들을 반환한다.
router.get('/challenges', isAuth, dashboardController.getMyChallenges);

export default router;
