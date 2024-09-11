import passport from 'passport';
import 'express-async-errors';
import express from 'express';
import JWT from 'jsonwebtoken';
import { env } from '../config/env.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

function createJwtToken(id, displayName, photo) {
  return JWT.sign(
    { id: id, displayName: displayName, photo: photo}, // 문자열이 아닌 객체로 전달해야 됨.
    env.jwt.secretKey,
    { expiresIn: env.jwt.expiresInSec }
  );
}

router.get('/google', (req, res, next) => {
  const redirectUri = req.query.redirect_uri;
  console.log(`[/google] 클라이언트에게 redirectUri ${redirectUri} 전달받음`);
  
  passport.authenticate('google', {
    scope: ['profile'],
    session: false,
    state: redirectUri
  })(req, res, next);
});

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), (req, res) => {
  const { id, displayName, photos } = req.user;
  const token = createJwtToken(id, displayName, photos[0].value);
  
  // res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: env.cookie.maxAge});  배포시 secure: true로
  res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: env.cookie.maxAge});
  
  const redirectUri = req.query.state;
  console.log(`[/google/callback] '/google' 에서 쿼리로 전달받은 redirectUri ${redirectUri} 전달받음`);
  
  res.redirect(redirectUri);
});

router.get('/profile', isAuth, (req, res) => {
  const { displayName, photo } = req.profile;
  res.json({ displayName: displayName, photo: photo });
});

router.post('/signout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // 배포시 true 로 설정
    sameSite: 'strict'
  });

  res.sendStatus(200);
});

// me?
router.get('/status', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(200).json({ isAuthenticated: false });
  }
  
  // 에러처리 todo
  JWT.verify(token, env.jwt.secretKey, async (error, decode) => {
    if (error) {
      return res.status(200).json({ isAuthenticated: false });
    }
  });

  return res.status(200).json({ isAuthenticated: true });
});

export default router;

// router.get('/token/validate', isAuth2, (req, res) => {
//   res.sendStatus(200);
// });

// router.get('/redirect', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
//   res.redirect('/login/profile');
// });

// router.get('/profile', (req, res) => {
//   if (req.isAuthenticated()) {
//     console.log(req.user);
//     res.send(`Hello, ${req.user.profile.displayName}`);
//   } else {
//     res.redirect('/');
//   }
// });

// router.get('/logout', (req, res) => {
//   req.logOut();
//   res.redirect('/');
// });
