import dotenv from 'dotenv';
dotenv.config();

function required(key, defaultValue = undefined) {
  const value = process.env[key] || defaultValue;
  if (value === null || value === undefined) {
    throw new Error(`dotenv error : Key ${key} 가 정의되지 않았거나 defaultValue를 설정하지 않음`);
  }
  
  return value;
}

export const env = {
  host: {
    port: parseInt(required('HOST_PORT', 8080)),
  },
  db: {
    host: required('DB_HOST'),
  },
  jwt: {
    secretKey: required('JWT_SECRET'),
    expiresInSec: parseInt(required('JWT_EXPIRES_SEC', 60*60)),/* 60*60 */
  },
  cookie: {
    maxAge: required('COOKIE_MAX_AGE_MS', 60*60*1000),/* 60*60*1000 */
  },
  bcrypt: {
    saltRounds: parseInt(required('BCRYPT_SALT_ROUNDS', 12)),
  },
  penalty: {
    maxWrong: parseInt(required('MAX_ANSWER_WRONG', 3)),
    time: parseInt(required('PENALTY_TIME_SEC', 60)),
  },
  google: {
    clientId: required('GOOGLE_CLIENT_ID'),
    clientSecret: required('GOOGLE_CLIENT_SECRET'),
    redirectUrl: required('GOOGLE_REDIRECT_URL')
  }
}
