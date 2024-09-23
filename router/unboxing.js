import 'express-async-errors';
import express from 'express';
import { isAuth } from '../middleware/auth.js';
import * as unboxingController from '../controller/unboxing.js';
import * as recordScreening from '../middleware/recordScreening.js';
import * as pandoraScreening from '../middleware/pandoraScreening.js';

const router = express.Router();

/**
 * [Fail response with reason]
 * 1. pandora 존재하지 않는 uuid | 비활성화 | solver 존재 (INACTIVE)
 * 2. pandora maker가 나일경우 (MINE)
 * 3. record가 존재하지 않을경우 (NOT_FOUND_RECORD)
 * 4. record가 풀이를 완료했을 경우 (SOLVED)
 * 5. record 패널티 기간일 경우 (PENELTY_PERIOD)
 */
router.get(
  '/pandora/:id/riddle', 
  isAuth, 
  pandoraScreening.validateChallengeablePandora, 
  recordScreening.validateChallengeableRecordForInitialRiddle, 
  unboxingController.setInitialRiddle
);

/**
 * [위에서 404 reason: NOT_FOUND_RECORD 응답을 받았을 경우 record를 생성요청]
 */
router.post(
  '/pandora/:id/riddle', 
  isAuth, 
  pandoraScreening.validateChallengeablePandora, 
  recordScreening.createInitialRecord, 
  unboxingController.setInitialRiddle
);

/**
 * [정답을 제출받고 검증 후 다음 수수께끼를 전달]
 */
router.patch(
  '/pandora/:id/riddle', 
  isAuth, 
  pandoraScreening.validateChallengeablePandora, 
  recordScreening.validateChallengeableRecordForNextRiddle, 
  unboxingController.getNextRiddle
);

/**
 * [solverAlias 를 설정했는지 안했는지 여부를 응답한다]
 */
router.get('/pandora/:id/solveralias', isAuth, recordScreening.validateIsSolver, unboxingController.getSolverAliasStatus);


/**
 * [solverAlias 를 등록한다]
 */
router.patch('/pandora/:id/solveralias', isAuth, recordScreening.validateIsSolver, unboxingController.registerSolverAlias);

/**
 * [cat을 note 이름으로 반환한다]
 * [isCatUncovered를 true로 만들고 반환한다.]
 */
router.patch('/pandora/:id/note', isAuth, recordScreening.validateIsSolver, unboxingController.getCat);

export default router;
