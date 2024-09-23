import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from "../../config/env.js";
import * as userDB from '../../data/user.js';

passport.use(new GoogleStrategy({
  clientID: env.google.clientId,
  clientSecret: env.google.clientSecret,
  callbackURL: env.google.redirectUrl 
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const googleData = {
      googleId: profile.id,
      googleName: profile.displayName,
      googleEmail: profile.emails[0].value,
      googlePhoto: profile.photos[0].value
    };
    
    const user = await userDB.findUserAndUpdate(googleData);
    if (!user) {
      await userDB.createUser(googleData);
    }

    return done(null, profile);
  } catch (error) {
    console.error(error);
    return done(error, null);
  }
}));

/**
 * profile =
 * 
 * {
  id: '105386305983127543782',
  displayName: 'woogle',
  name: { familyName: undefined, givenName: 'woogle' },
  emails: [ { value: '2coldok@gmail.com', verified: true } ],
  photos: [
    {
      value: 'https://lh3.googleusercontent.com/a/ACg8ocK2SlXU5VGDFVu232i2X8BYruBwJJcsX5WEHawGLBn6GegvnGs=s96-c'
    }
  ],
  provider: 'google',
  _raw: '{\n' +
    '  "sub": "105386305983127543782",\n' +
    '  "name": "woogle",\n' +
    '  "given_name": "woogle",\n' +
    '  "picture": "https://lh3.googleusercontent.com/a/ACg8ocK2SlXU5VGDFVu232i2X8BYruBwJJcsX5WEHawGLBn6GegvnGs\\u003ds96-c",\n' +
    '  "email": "2coldok@gmail.com",\n' +
    '  "email_verified": true\n' +
    '}',
  _json: {
    sub: '105386305983127543782',
    name: 'woogle',
    given_name: 'woogle',
    picture: 'https://lh3.googleusercontent.com/a/ACg8ocK2SlXU5VGDFVu232i2X8BYruBwJJcsX5WEHawGLBn6GegvnGs=s96-c',
    email: '2coldok@gmail.com',
    email_verified: true
  }
}
*
**/