import JWT from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
import * as userDB from '../data/user.js';
import { config } from '../config.js';

export async function signup(req, res) {
  const { username } = req.body;
  const user = await userDB.findByUserName(username);
  if (user) {
    return res.status(409).json({ message: `${user.username} 이라는 username이 이미 존재합니다.` });
  }
  
  const userId = await userDB.create(username);
  const token = createJwtToken(userId);

  res.status(201).json({ token, username });
}

function createJwtToken(userId) {
  return JWT.sign({ userId }, config.jwt.secretKey, { expiresIn: config.jwt.expiresInMsec });
}