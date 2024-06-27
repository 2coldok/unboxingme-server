import 'express-async-errors';
import express from 'express';
import * as pandoraController from '../controller/pandora.js';

const router = express.Router();

// GET /search?keyword=고양이
// client: 키워드로 검색시 판도라 리스트를 보여줄때 사용
router.get('/', pandoraController.getPandorasByKeywordForSearcher);

export default router;
