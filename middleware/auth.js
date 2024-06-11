import JWT from 'jsonwebtoken';
import { env } from '../config/env.js';

export const isAuth = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!(authHeader && authHeader.startsWith('Bearer'))) {
    return res.status(401).json({ message: '인증 오류: 해더에 Authorization이 존재하지 않거나 해더 내용이 Bearer로 시작하지 않음' });
  }

  const token = authHeader.split(' ')[1];

  JWT.verify(token, env.jwt.secretKey, async (error, decode) => {
    if (error) {
      return res.status(401).json({ message: '인증 오류: 유효하지 않은 토큰임'});
    }

    req.userId = decode.userId;
    req.token = token;
    console.log('auth.js: 인증완료. 다음 단계로'); //
    next();
  });
}
