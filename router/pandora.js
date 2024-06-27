import 'express-async-errors';
import express from 'express';
import * as pandoraController from '../controller/pandora.js';
import * as unboxingController from '../controller/unboxing.js';

import { isAuth } from '../middleware/auth.js';
import { recordScreening } from '../middleware/recordScreening.js';

const router = express.Router();

// client: 판도라 표지에 사용, http://localhost:5173/pandora/1234
router.get('/:id', pandoraController.getPandoraCoverByIdForChallenger);

// 판도라 상자 만들기
router.post('/create', isAuth, pandoraController.createPandora); 

router.post('/:id', isAuth, recordScreening, unboxingController.getNextProblem); // 정답 확인 및 다음 문제 받기 => isAuth 다음에 pandoraScreening추가해야됨

export default router;
