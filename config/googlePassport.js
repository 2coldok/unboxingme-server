import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from "./env.js";

passport.use(new GoogleStrategy({
  clientID: env.google.clientId,
  clientSecret: env.google.clientSecret,
  callbackURL: env.google.redirectUrl // google cloud setting 과 동일한지 확인
},
(accessToken, refreshToken, profile, done) => {
  // db 처리 Todo. 할 필요 없을듯

  // return done(null, { profile, token });
  return done(null, profile);
}));
