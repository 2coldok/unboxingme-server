import 'express-async-errors';
import express from 'express';
import * as pandoraController from '../controller/pandora.js';
import { isAuth } from '../middleware/auth.js';
import * as payloadPandoraValidator from '../middleware/validator/pandora.js';
import { validatePage } from '../middleware/validator/page.js';
import { validateUUIDV4 } from '../middleware/validator/uuidv4.js';
import { validateIsMyNotSolvedPandora } from '../middleware/pandoraScreening.js';
import { deleteAllRecordsOfMyPandora } from '../middleware/recordScreening.js';
import * as pandoraLimiter from '../middleware/ratelimit/pandora.js';
import { assignGuestId } from '../middleware/guest.js';

const router = express.Router();

// 판도라 검색 결과들
router.get(
  '/search',
  assignGuestId,
  pandoraLimiter.readSearchResult,
  payloadPandoraValidator.searchKeyword, 
  pandoraController.getPandorasFSearchResult
);

// 판도라 표지 결과
router.get(
  '/cover/:id',
  assignGuestId,
  pandoraLimiter.readPandoraCover,
  validateUUIDV4, 
  pandoraController.getPandoraFCover
);

// 내가 만든 판도라들 가져오기(마이페이지 확인용)
router.get(
  '/mine', 
  isAuth,
  pandoraLimiter.readMyPandoras, 
  validatePage,
  pandoraController.getMyPandoras
);

// 내가 만든 판도라 가져오기(수정용)
router.get(
  '/edit/:id',
  isAuth,
  pandoraLimiter.readMyPandoraForEdit,
  validateUUIDV4, 
  pandoraController.getMyPandoraFEdit
);

// 나의 판도라 생성
router.post(
  '/create', 
  isAuth,
  pandoraLimiter.createMyPandora,
  payloadPandoraValidator.newPandora, 
  pandoraController.createNewPandora
);

// 내가 만든 판도라 삭제 (판도라 삭제 후 record를 삭제하는 순서로 진행됨)
router.delete(
  '/delete/:id', 
  isAuth, 
  pandoraLimiter.deleteMyPandora,
  validateUUIDV4,
  pandoraController.deleteMyPandora
);

// 내가 만든 판도라 수정 (record를 먼저 삭제 후 판도라를 수정하는 순서로 진행됨)
router.put(
  '/edit/:id',
  isAuth,
  pandoraLimiter.editMyPandora,
  validateUUIDV4, 
  payloadPandoraValidator.newPandora,
  validateIsMyNotSolvedPandora, // 유효성 검사 후 active: false로 잠시변환
  deleteAllRecordsOfMyPandora, // challenger들 record 모두 삭제
  pandoraController.editMyPandora // active: true와 함께 수정
);

export default router;
