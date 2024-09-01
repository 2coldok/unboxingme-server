import Mongoose from 'mongoose';
import { env } from '../config/env.js';

export async function connectDB() {
  Mongoose.connect(env.db.host);
}

export function setupPandoraSchema(schema) {
  function transformFunction(doc, ret) {
    // _id 속성 제거
    delete ret._id;

    // maker 속성 제거
    delete ret.maker;

    // problems 배열의 각 원소의 _id 제거
    if (Array.isArray(ret.problems)) {
      ret.problems.forEach(problem => {
        delete problem._id;
      });
    }

    // Date 필드들을 ISO 문자열로 변환
    if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
    if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();
    if (ret.solvedAt) ret.solvedAt = ret.solvedAt.toISOString();

    return ret;
  }

  schema.set('toObject', { transform: transformFunction });
  schema.set('toJSON', { transform: transformFunction });
}

export function setupRecordSchema(schema) {
  function transformFunction(doc, ret) {
    // _id 속성 제거
    delete ret._id;

    // Date 필드들을 ISO 문자열로 변환
    if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
    if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();
    if (ret.restrictedUntil) ret.restrictedUntil = ret.restrictedUntil.toISOString();
    
    return ret;
  }

  schema.set('toObject', { transform: transformFunction });
  schema.set('toJSON', { transform: transformFunction });
}
