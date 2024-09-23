import 'express-async-errors';
import express from 'express';
import { isAuth } from '../middleware/auth.js';
import * as authController from '../controller/authController/auth.js';

const router = express.Router();

/**
 * 구글 로그인 시작
 */
router.get('/google', authController.googleLoginPage);

/**
 * google 서버와 통신 전용
 * 로그인 성공시 redirect
 * 로그인 실패시 redirect
 */
router.get('/google/callback', authController.googleCallbackAndIssueToken);

/**
 * 로그아웃
 */
router.post('/logout', isAuth, authController.logout);

/**
 * 나의 프로필 정보 불러오기
 */
router.get('/profile', isAuth, authController.profile);

/**
 * 나의 토큰이 유효한지 확인하기
 */
router.get('/me', authController.me);

export default router;
