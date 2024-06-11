import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from "./env.js";
import JWT from 'jsonwebtoken';

function createJwtToken(googleId) {
  return JWT.sign(
    { id: googleId }, // 문자열이 아닌 객체로 전달해야 됨.
    env.jwt.secretKey,
    { expiresIn: env.jwt.expiresInMsec }
  );
}

passport.use(new GoogleStrategy({
  clientID: env.google.clientId,
  clientSecret: env.google.clientSecret,
  callbackURL: env.google.redirectUrl // google cloud setting 과 동일한지 확인
},
(accessToken, refreshToken, profile, done) => {
  const token = createJwtToken(profile.id);

  // Todo 
  // db 처리

  return done(null, { profile, token });
}));
