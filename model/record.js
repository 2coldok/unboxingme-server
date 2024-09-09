import Mongoose from 'mongoose';

const recordSchema = new Mongoose.Schema({
  challenger: { type: String, required: true }, // 유저의 googleId(string)
  pandora: { type: String, required: true }, // Pandora uuid(string)
  failCount: { type: Number, required: true, default: 0 },
  restrictedUntil: { type: Date, requried: true, default: null }, 
  unsealedQuestionIndex: { type: Number, required: false, default: 0 }, // 모든 문제를 해결한 경우 null값을 가진다
  unboxing: { type: Boolean, required: true, default: false },
}, { timestamps: true, versionKey: false });

// DB수준에서 challenger 와 pandora의 조합을 고유하게 갖도록 unique index 설정
recordSchema.index({ challenger: 1, pandora: 1 }, { unique: true });

const Record = Mongoose.model('Record', recordSchema);

export default Record;
