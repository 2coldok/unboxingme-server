import 'express-async-errors';
import express from 'express';
import * as pandoraController from '../controller/pandora.js';
import { screeningElpisAccess } from '../middleware/recordScreening.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /pandora/search?keyword=고양이
// 키워드로 검색시 판도라 리스트를 보여줌
router.get('/search', pandoraController.getPandorasFSearchResult);

// GET /pandora/cover/66e6r6e3788812
// client: 판도라 표지를 보여줌
router.get('/cover/:id', pandoraController.getPandoraFCover);

// POST /pandora/create
// 판도라 상자 만들기
router.post('/create', isAuth, pandoraController.createNewPandora); 

// PATCH /pandora/elpis/66e6r6e3788812
// 최종 메세지 가져오기
router.patch('/elpis/:id', isAuth, screeningElpisAccess, pandoraController.getElpisFOnlyFirstSolver);

// GET /pandora/mine
// 내가 만든 판도라 리스트 불러오기
router.get('/mine', isAuth, pandoraController.getMyPandoras);

export default router;
