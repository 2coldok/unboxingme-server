import JWT from 'jsonwebtoken';
import { env } from '../../config/env.js';

export function createJwtToken(googleId) {
  return JWT.sign(
    { googleId: googleId }, // 문자열이 아닌 객체로 전달해야 됨.
    env.jwt.secretKey,
    { expiresIn: env.jwt.expiresInSec }
  );
}