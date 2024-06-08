import Mongoose from 'mongoose';
import { setupSchemaVirtuals } from '../database/database.js';

const userSchema = new Mongoose.Schema({
  username: { type: String, required: true }, // 익명 또는 고유한 username
});

setupSchemaVirtuals(userSchema);
const User = Mongoose.model('User', userSchema);

export async function findById(userId) {
  return User.findById(userId);
}

export async function findByUserName(username) {
  return User.findOne({ username: username });
}

export async function create(username) {
  const newUser = new User({
    username: username
  });
  
  // User를 생성 후 user의 id를 반환
  return newUser.save().then((data) => data.id);
}
