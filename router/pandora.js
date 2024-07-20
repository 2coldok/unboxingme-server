import 'express-async-errors';
import express from 'express';
import * as pandoraController from '../controller/pandora.js';
import * as unboxingController from '../controller/unboxing.js';

import { isAuth } from '../middleware/auth.js';

const router = express.Router();

// client: 판도라 표지에 사용, http://localhost:5173/pandora/1234
router.get('/:id', pandoraController.getPandoraCoverByIdForChallenger);

// 판도라 상자 만들기
router.post('/create', isAuth, pandoraController.createPandora); 

// 내가 만든 판도라 리스트 불러오기
router.get('/issuer/details', isAuth, pandoraController.getMyPandoras);

export default router;
