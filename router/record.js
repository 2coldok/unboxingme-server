import 'express-async-errors';
import express from 'express';

import * as recordController from '../controller/record.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', isAuth, recordController.getRecord);

export default router;
