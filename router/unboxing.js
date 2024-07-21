import 'express-async-errors';
import express from 'express';
import * as pandoraController from '../controller/pandora.js';
import * as unboxingController from '../controller/unboxing.js';
import { isAuth } from '../middleware/auth.js';
import { createRecord, recordScreeningOfExistence ,recordScreeningOfNextProblem } from '../middleware/recordScreening.js';

const router = express.Router();

router.get('/:id', isAuth, recordScreeningOfExistence, unboxingController.setupInitialGreenroom);

router.post('/:id', isAuth, createRecord, unboxingController.setupInitialGreenroom);

router.patch('/:id', isAuth, recordScreeningOfNextProblem, unboxingController.getNextProblem); // 정답 확인 및 다음 문제 받기 => isAuth 다음에 pandoraScreening추가해야됨

export default router;
