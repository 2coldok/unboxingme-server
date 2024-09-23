import JWT from 'jsonwebtoken';
import { env } from '../config/env.js';
import { failResponse } from '../response/response.js';

// 쿠키 방식
export async function isAuth(req, res, next) {
  const token = req.cookies.token; // 클라이언트에서 { withCredentials: true } 옵션을 통해(axios, fetch 둘이 설정방법 조금 다름) 쿠키를 포함해서 보내기때문에 추출 가능
  if (!token) {
    return failResponse(res, 401, null, '토큰이 존재하지 않습니다.');
  }

  JWT.verify(token, env.jwt.secretKey, async (error, decode) => {
    if (error) {
      return failResponse(res, 401, null, '유효하지 않은 토큰입니다.');
    }
    
    req.profile = decode;
    req.userId = decode.googleId;
    
    req.googleId = decode.googleId; // 구글아이디 타입은 string
  
    return next();
  });
}

// 로컬스토리지 + Bearer 토큰 방식
// export const isAuth = async (req, res, next) => {
//   const authHeader = req.get('Authorization');
//   if (!(authHeader && authHeader.startsWith('Bearer'))) {
//     return res.status(401).json({ message: '인증 오류: 해더에 Authorization이 존재하지 않거나 해더 내용이 Bearer로 시작하지 않음' });
//   }

//   const token = authHeader.split(' ')[1];

//   JWT.verify(token, env.jwt.secretKey, async (error, decode) => {
//     if (error) {
//       return res.status(401).json({ message: '인증 오류: 유효하지 않은 토큰임'});
//     }

//     req.userId = decode.userId;
//     req.token = token;
//     console.log('auth.js: 인증완료. 다음 단계로'); //
//     next();
//   });
// }