import 'express-async-errors';
import express from 'express';
import * as unboxingController from '../controller/unboxing.js';
import { isAuth } from '../middleware/auth.js';
import { screeningCreate, screeningExistence , screeningNextProblem } from '../middleware/recordScreening.js';
import { screeningActiveAndSolver } from '../middleware/pandoraScreening.js';

const router = express.Router();

router.get('/:id', isAuth, screeningActiveAndSolver, screeningExistence, unboxingController.getInitialGateWay);

router.post('/:id', isAuth, screeningActiveAndSolver, screeningCreate, unboxingController.getInitialGateWay);

router.patch('/:id', isAuth, screeningActiveAndSolver, screeningNextProblem, unboxingController.getNextProblem); 

export default router;
