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

export default router;
