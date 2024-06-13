import passport from 'passport';
import 'express-async-errors';
import express from 'express';
import JWT from 'jsonwebtoken';
import { env } from '../config/env.js';
import { isAuth2 } from '../middleware/auth.js';

const router = express.Router();

function createJwtToken(id, displayName, photo) {
  return JWT.sign(
    { id: id, displayName: displayName, photo: photo}, // 문자열이 아닌 객체로 전달해야 됨.
    env.jwt.secretKey,
    { expiresIn: env.jwt.expiresInSec }
  );
}

router.get('/google', passport.authenticate('google', {
  scope: ['profile'],       
  session: false
}));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), (req, res) => {
  const { id, displayName, photos } = req.user;
  const token = createJwtToken(id, displayName, photos[0].value);
  
  // res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict'});  배포시 secure: true로
  res.cookie('token', token, { httpOnly: true, sameSite: 'strict'});
  console.log('http://localhost:5173 로 리디렉트 GO');
  res.redirect('http://localhost:5173');
});

router.get('/profile', isAuth2, (req, res) => {
  res.json({ displayName: req.profile.displayName, photo: req.profile.photo });
});

router.get('/token/validate', isAuth2, (req, res) => {
  res.sendStatus(200);
});

router.post('/signout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // 배포시 true 로 설정
    sameSite: 'strict'
  });

  res.sendStatus(200);
});


export default router;

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
