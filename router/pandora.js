import 'express-async-errors';
import express from 'express';
import * as pandoraController from '../controller/pandora.js';
import * as pandoraScreening from '../middleware/pandoraScreening.js';
import * as recordScreening from '../middleware/recordScreening.js'
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /pandora/create
// 판도라 상자 만들기
router.post('/create', isAuth, pandoraController.createNewPandora); 

// GET /pandora/search?keyword=고양이
// 키워드로 검색시 판도라 리스트를 보여줌
router.get('/search', pandoraController.getPandorasFSearchResult);

// GET /pandora/cover/66e6r6e3788812
// client: 판도라 표지를 보여줌
router.get('/cover/:id', pandoraController.getPandoraFCover);

// solverAlias 설정 여부를 true or false로 반환한다.
// 설정 여부는 오직 solver만 확인할 수 있다.
router.get('/solveralias/:id', isAuth, recordScreening.screeningCheckInAuthorization, pandoraScreening.screeningPandoraSolver, pandoraController.getSolverAliasStatus);

// solverAlias를 최초로 등록한다. void를 반환한다.
router.patch('/solveralias/:id', isAuth, recordScreening.screeningCheckInAuthorization, pandoraScreening.screeningPandoraSolver, pandoraController.registerSolverAlias);

// GET /pandora/elpis/66e6r6e3788812
// 최종 메세지 가져오기(isCatUpdated가 true일 경우 elpis를 반환. false일 경우 true로 만들고 반환한다.)
router.patch('/elpis/:id', isAuth, recordScreening.elpisAccessAuthorization, pandoraScreening.elpisAccessAuthorization, pandoraController.getElpis);

// GET /pandora/mine
// 내가 만든 판도라 리스트 불러오기
router.get('/mine', isAuth, pandoraController.getMyPandoras);

// DELETE
// 내가 만든 판도라 삭제
router.delete('/delete/:id', isAuth, pandoraController.deleteMyPandora);

// PUT
// 내가 만든 판도라 수정
router.put('/replace/:id', isAuth, pandoraController.relaceMyPandora);

// 수정용으로 나의 판도라 데이터 가져오기
router.get('/edit/:id', isAuth, pandoraController.getMyPandoraFEdit);


export default router;
