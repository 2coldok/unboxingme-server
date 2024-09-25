import 'express-async-errors';
import express from 'express';
import * as pandoraController from '../controller/pandora.js';
import { isAuth } from '../middleware/auth.js';
import * as payloadPandoraValidator from '../middleware/validator/pandora.js';
import { validatePage } from '../middleware/validator/page.js';
import { validateUUIDV4 } from '../middleware/validator/uuidv4.js';

const router = express.Router();

// 판도라 검색 결과들
router.get(
  '/search', 
  payloadPandoraValidator.searchKeyword, 
  pandoraController.getPandorasFSearchResult
);

// 판도라 표지 결과
router.get(
  '/cover/:id',
  validateUUIDV4, 
  pandoraController.getPandoraFCover
);

// 내가 만든 판도라들 가져오기(마이페이지 확인용)
router.get(
  '/mine', 
  isAuth, 
  validatePage,
  pandoraController.getMyPandoras
);

// 내가 만든 판도라 가져오기(수정용)
router.get(
  '/edit/:id',
  isAuth, 
  validateUUIDV4, 
  pandoraController.getMyPandoraFEdit
);

// 나의 판도라 생성
router.post(
  '/create', 
  isAuth, 
  payloadPandoraValidator.newPandora, 
  pandoraController.createNewPandora
);

// 내가 만든 판도라 삭제
router.delete(
  '/delete/:id', 
  isAuth, 
  validateUUIDV4,
  pandoraController.deleteMyPandora
);

// 내가 만든 판도라 수정
router.put(
  '/replace/:id',
  isAuth, 
  validateUUIDV4, 
  payloadPandoraValidator.newPandora, 
  pandoraController.relaceMyPandora
);

export default router;
