import Mongoose from 'mongoose';
import { setupRecordSchema } from '../database/database.js';

const recordSchema = new Mongoose.Schema({
  challenger: { type: String, required: true }, // 유저의 googleId(string)
  pandora: { type: String, required: true }, // Pandora uuid(string)
  failCount: { type: Number, required: true, default: 0 },
  restrictedUntil: { type: Date, requried: true, default: null }, 
  unsealedQuestionIndex: { type: Number, required: false, default: 0 }, // 모든 문제를 해결한 경우 null값을 가진다
  unboxing: { type: Boolean, required: true, default: false },
}, { timestamps: true, versionKey: false });

setupRecordSchema(recordSchema);
const Record = Mongoose.model('Record', recordSchema);

/**
 * [records 탐색]
 * 조건: pandoraUuid 일치
 */
export async function findRecordsByPandoraUuid(pandoraUuid) {
  const records = await Record
    .find({ pandora: pandoraUuid })
    .lean()
    .exec(); // 없으면 null

  return records;
}

/**
 * [새로운 record 생성]
 */
export async function create(challengerGoogleId, pandoraUuid) {
  const newRecord = new Record({
    challenger: challengerGoogleId,
    pandora: pandoraUuid,
  });

  const savedRecord = await newRecord.save();

  return savedRecord.toObject();
}

/**
 * [단일 record]
 * challengerGoogleId + pandoraUuid 가 일치하는 record를 찾아 반환한다.
 * record를 찾지 못하면 null을 반환한다.
 */
export async function findRecord(challengerGoogleId, pandoraUuid) {
  return Record.findOne({ challenger: challengerGoogleId, pandora: pandoraUuid }).lean().exec();
}

/**
 * [record 통합 업데이트]
 * challengerGoogleId + pandoraUuid 에 해당하는 record를 업데이트 한다.
 * 업데이트 된 record를 반환한다(new: true)
 */
export async function update(challengerGoogleId, pandoraUuid, updates) {
  const updatedRecord = await Record
    .findOneAndUpdate(
      { challenger: challengerGoogleId, pandora: pandoraUuid },
      { $set: updates },
      { new: true, runValidators: true })
    .lean()  
    .exec();  

  return updatedRecord;
}
