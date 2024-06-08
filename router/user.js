import express from 'express';
import * as userController from '../controller/user.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', userController.signup);

export default router;
