import 'express-async-errors';
import express from 'express';
import * as pandoraController from '../controller/pandora.js';
import * as unboxingController from '../controller/unboxing.js';

import { isAuth } from '../middleware/auth.js';
import { recordScreening } from '../middleware/recordScreening.js';

const router = express.Router();

// GET


// POST
router.post('/', isAuth, pandoraController.createPandora); // 판도라 상자 생성
router.post('/:id', isAuth, recordScreening, unboxingController.getNextProblem); // 정답 확인 및 다음 문제 받기

export default router;
