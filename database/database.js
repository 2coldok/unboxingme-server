import Mongoose from 'mongoose';
import { config } from '../config.js';

export async function connectDB() {
  Mongoose.connect(config.db.host);
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
    return ret;
  };
  
  schema.set('toJSON', { virtuals: true, transform });
  schema.set('toObject', { virtuals: true, transform });
}
