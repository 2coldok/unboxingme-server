import passport from 'passport';
import 'express-async-errors';
import express from 'express';

const router = express.Router();

// 구글 로그인 시작 엔드포인트
// Google OAuth 2.0 인증 페이지로 리디렉션
// 로그인 후 권한을 승인하면, Google이 /auth/login/callback 으로 리디렉션
router.get('/login', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

// 사용자가 Google에서 인증을 받은 후 사용자가 리디렉션되는 앤드포인트
// passport는 config에 따라 인증 결과를 처리한다.
// 인증이 성공하면 req.user 객체에 토큰과 사용자 정보가 포함된다.
router.get('/login/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), (req, res) => {
  const userData = req.user.profile;

  res.send(`<h1>${userData.displayName} 님 환영합니다. 로그인 성공</h1>`);
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
