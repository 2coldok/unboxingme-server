import 'express-async-errors';
import express from 'express';
import { isAuth } from '../middleware/auth.js';
import * as pandoraScreening from '../middleware/pandoraScreening.js';
import * as dashboardController from '../controller/dashboard.js';

const router = express.Router();

// www.riddlenote.com/dashboard/mine/596782f3-4c0b-4dc4-a59b-56ca5d9f0a59/log 에서 사용함
// id는 pandora의 uuid
router.get('/:id/log', isAuth, pandoraScreening.verifyPandoraMaker, dashboardController.getMyPandoraLog);

export default router;
