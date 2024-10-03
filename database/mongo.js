import Mongoose from 'mongoose';
import { env } from '../config/env.js';

// export async function connectDB() {
//   Mongoose.connect(env.db.host);
// }

export async function connectMongoDB() {
  try {
    await Mongoose.connect(env.db.mongoHost);
    console.log('MongoDB 연결 성공');
  } catch (error) {
    console.error('몽고 DB 연결 오류:', error);
    throw error;
  }
}
