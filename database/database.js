import Mongoose from 'mongoose';
import { env } from '../config/env.js';

export async function connectDB() {
  Mongoose.connect(env.db.host);
}

// 가상 id : string 적용
// json, object 접근시 _id, _v 제거 및 id 추가
export function setupSchemaVirtuals(schema) {
  schema.virtual('id').get(function() {
    return this._id.toString();
  });

  const transform = (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    
    // problems가 있을경우 이 역시 _id 대신 id를 를 사용하도록 설정
    if (ret.problems && ret.problems.length > 0) {
      ret.problems = ret.problems.map(problem => {
        problem.id = problem._id.toString();
        delete problem._id;
        return problem;
      });
    }

    return ret;
  };

  schema.set('toJSON', { virtuals: true, transform });
  schema.set('toObject', { virtuals: true, transform });
}

export function setupPandoraSchemaVirtuals(schema) {
  schema.virtual('id').get(function() {
    return this._id.toString();
  });

  const transform = (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id; // _id 제거
    delete ret.__v; // __v 제거
    delete ret.maker; // maker 제거

    // Date 객체를 ISO 문자열로 변환
    if (ret.createdAt && ret.updatedAt) {
      ret.createdAt = ret.createdAt.toISOString();
      ret.updatedAt = ret.updatedAt.toISOString();
    }
    
    // 하위문서 problems의 id, _id 모두 삭제
    if (ret.problems && ret.problems.length > 0) {
      ret.problems = ret.problems.map(problem => {
        // problem.id = problem._id.toString();
        delete problem._id;
        delete problem.id;
        return problem;
      });
    }

    return ret;
  };

  schema.set('toJSON', { virtuals: true, transform });
  schema.set('toObject', { virtuals: true, transform });
}
