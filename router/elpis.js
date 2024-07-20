import 'express-async-errors';
import express from 'express';

import * as pandoraController from '../controller/pandora.js';
import { isAuth } from '../middleware/auth.js';
import { recordScreeningOfElpisAccess } from '../middleware/recordScreening.js';

const router = express.Router();

router.get('/:id', isAuth, recordScreeningOfElpisAccess, pandoraController.getElpis);

export default router;
