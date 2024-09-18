import 'express-async-errors';
import express from 'express';
import { isAuth } from '../middleware/auth.js';
import * as unboxingController from '../controller/unboxing.js';
import * as recordScreening from '../middleware/recordScreening.js';
import * as pandoraScreening from '../middleware/pandoraScreening.js';

const router = express.Router();

router.get('/:id', isAuth, pandoraScreening.validatePandoraAccess, recordScreening.checkExists, unboxingController.getInitialGateWay);

router.post('/:id', isAuth, pandoraScreening.validatePandoraAccess, recordScreening.createInitial, unboxingController.getInitialGateWay);

router.patch('/:id', isAuth, pandoraScreening.validatePandoraAccess, recordScreening.validateNextProblemAccess, unboxingController.getNextGateWay); 


// solverAlias 설정 여부를 true or false로 반환한다.
// 설정 여부는 오직 solver만 확인할 수 있다.
router.get('/solveralias/:id', isAuth, recordScreening.validateIsSolver, pandoraScreening.screeningPandoraSolver, unboxingController.getSolverAliasStatus);

// solverAlias를 최초로 등록한다. void를 반환한다.
router.patch('/solveralias/:id', isAuth, recordScreening.validateIsSolver, pandoraScreening.screeningPandoraSolver, unboxingController.registerSolverAlias);

// GET /pandora/elpis/66e6r6e3788812
// 최종 메세지 가져오기(isCatUpdated가 true일 경우 elpis를 반환. false일 경우 true로 만들고 반환한다.)
router.patch('/elpis/:id', isAuth, recordScreening.elpisAccessAuthorization, pandoraScreening.elpisAccessAuthorization, unboxingController.getElpis);

export default router;
