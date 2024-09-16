import 'express-async-errors';
import express from 'express';
import * as pandoraController from '../controller/pandora.js';
import * as pandoraScreening from '../middleware/pandoraScreening.js';
import * as recordScreening from '../middleware/recordScreening.js'
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

// 판도라 검색 결과들
router.get('/search', pandoraController.getPandorasFSearchResult);

// 판도라 표지 결과
router.get('/cover/:id', pandoraController.getPandoraFCover);

// 내가 만든 판도라들 가져오기(마이페이지 확인용)
router.get('/mine', isAuth, pandoraController.getMyPandoras);

// 내가 만든 판도라 가져오기(수정용)
router.get('/edit/:id', isAuth, pandoraController.getMyPandoraFEdit);

// 나의 판도라 생성
router.post('/create', isAuth, pandoraController.createNewPandora); 

// 내가 만든 판도라 삭제
router.delete('/delete/:id', isAuth, pandoraController.deleteMyPandora);

// 내가 만든 판도라 수정
router.put('/replace/:id', isAuth, pandoraController.relaceMyPandora);






// solverAlias 설정 여부를 true or false로 반환한다.
// 설정 여부는 오직 solver만 확인할 수 있다.
router.get('/solveralias/:id', isAuth, recordScreening.screeningCheckInAuthorization, pandoraScreening.screeningPandoraSolver, pandoraController.getSolverAliasStatus);

// solverAlias를 최초로 등록한다. void를 반환한다.
router.patch('/solveralias/:id', isAuth, recordScreening.screeningCheckInAuthorization, pandoraScreening.screeningPandoraSolver, pandoraController.registerSolverAlias);

// GET /pandora/elpis/66e6r6e3788812
// 최종 메세지 가져오기(isCatUpdated가 true일 경우 elpis를 반환. false일 경우 true로 만들고 반환한다.)
router.patch('/elpis/:id', isAuth, recordScreening.elpisAccessAuthorization, pandoraScreening.elpisAccessAuthorization, pandoraController.getElpis);










export default router;
