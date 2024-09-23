import passport from "passport";
import { createJwtToken } from "./createJwtToken.js";
import { failResponse, successResponse } from "../../response/response.js";
import * as userDB from '../../data/user.js';
import { mMe, mProfile } from "../../mold/user.js";
import { env } from "../../config/env.js";
import JWT from 'jsonwebtoken';

/**
 * [구글 로그인 페이지]
 */
export async function googleLoginPage(req, res, next) {
  const redirectUri = req.query.redirect_uri;

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: redirectUri
  })(req, res, next);
}

/**
 * [토큰 발급]
 */
export async function googleCallbackAndIssueToken(req, res, next) {
  passport.authenticate('google', { failureRedirect: '/', session: false }, (error, profile) => {
    if (error) {
      return res.redirect(`/fallback/login-failed?message=${encodeURIComponent('구글 로그인에 실패했습니다.')}`);
    }
    
    if (!profile) {
      return res.redirect(`/fallback/login-failed?message=${encodeURIComponent('구글 프로필 정보 가져오기 실패')}`);
    }

    const googleId = profile.id;
    const token = createJwtToken(googleId);
    
    // 쿠키에 토큰 설정 (배포 시 secure 설정)
    res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: env.cookie.maxAge });

    // 구글 로그인 페이지에서 전달한 redirectUri로 리다이렉트
    const redirectUri = req.query.state;

    // success 응답인 redirect에 대해서 클라이언트는 처리할 필요 없음.
    return res.redirect(redirectUri);
  })(req, res, next);
}

/**
 * [로그아웃]
 */
export async function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // 배포시 true 로 설정
    sameSite: 'strict'
  });

  return successResponse(res, 200, null, '로그아웃 성공');
}

/**
 * [나의 프로필]
 */
export async function profile(req, res) {
  try {
    const googleId = req.googleId;
    const user = await userDB.findUserByGoogleId(googleId);
    if (!user) {
      return failResponse(res, 404, null, 'user 데이터를 찾을 수 없습니다.');
    }

    const data = mProfile(user);

    return successResponse(res, 200, data);
  } catch (error) {
    return failResponse(res, 500);
  }
}

/**
 * [내 토큰이 유효해?]
 */
export async function me(req, res) {
  const token = req.cookies.token;
  if (!token) {
    return failResponse(res, 401, null, '토큰이 존재하지 않습니다.');
  }

  JWT.verify(token, env.jwt.secretKey, async (error, decode) => {
    if (error) {
      const data = mMe(false);
      return successResponse(res, 200, data);
    }
    
    const data = mMe(true);
    return successResponse(res, 200, data);
  });
}
