import Mongoose from 'mongoose';
import { setupSchemaVirtuals } from '../database/database.js';

const recordSchema = new Mongoose.Schema({
  challenger: { type: String, required: true },
  pandora: { type: Mongoose.Schema.Types.ObjectId, ref: 'Pandora', required: true },
  failCount: { type: Number, required: true, default: 0 },
  restrictedUntil: { type: Date, requried: true, default: null }, 
  unsealedQuestionIndex: { type: Number, required: false, default: 0 }, // 모든 문제를 해결한 경우 null값을 가진다
  unboxing: { type: Boolean, required: true, default: false },
}, { timestamps: true });

setupSchemaVirtuals(recordSchema);
const Record = Mongoose.model('Record', recordSchema);

/**
 * 조건: pandoraId 일치
 * 반환: 온전한 reocrd 스키마 데이터 배열을 반환한다.
 */
export async function findRecordsByPandoraId(pandoraId) {
  const records = await Record.find({ pandora: pandoraId }).exec();

  return records.map(record => record.toObject());
}

/**
 * challengerId, pandoraId 를 통해 새로운 record를 생성한다.
 */
export async function create(challengerId, pandoraId) {
  const newRecord = new Record({
    challenger: challengerId,
    pandora: pandoraId,
  });

  const savedRecord = await newRecord.save();

  return savedRecord;
}

/**
 * challengerId + pandoraId 가 일치하는 record를 찾아 반환한다.
 * record를 찾지 못하면 null을 반환한다.
 */
export async function findRecord(challengerId, pandoraId) {
  return Record.findOne({ challenger: challengerId, pandora: pandoraId }).exec();
}

/**
 * challengerId + pandoraId 에 해당하는 record를 업데이트 한다.
 * 업데이트 된 record를 반환한다(new: true)
 */
export async function update(challengerId, pandoraId, updates) {
  const updatedRecord = await Record.findOneAndUpdate(
    { challenger: challengerId, pandora: pandoraId },
    { $set: updates },
    { new: true, runValidators: true }
  ).exec();

  if (!updatedRecord) {
    throw new Error('DB 에서 Record 찾기 실패');
  }

  return updatedRecord.toObject();
}
