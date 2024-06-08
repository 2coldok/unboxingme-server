import 'express-async-errors';
import express from 'express';
import * as pandoraController from '../controller/pandora.js';

const router = express.Router();

// GET /search?keyword=고양이
router.get('/', pandoraController.getSkinOfPandorasByKeyword);

export default router;
