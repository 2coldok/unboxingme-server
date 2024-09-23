import Mongoose from 'mongoose';

const userSchema = new Mongoose.Schema({
  googleId: { type: String, required: true },
  googleName: { type: String, required: true },
  googleEmail: { type: String, required: true },
  googlePhoto: { type: String, required: true },
  nickname: { type: String, default: null },
  password: { type: String, default: null }
}, { timestamps: true, versionKey: false });

userSchema.index({ googleId: 1 }, { unique: true });

const User = Mongoose.model('User', userSchema);

export default User;
