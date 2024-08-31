import Mongoose from 'mongoose';
import { setupSchemaVirtuals } from '../database/database.js';

const recordSchema = new Mongoose.Schema({
  challenger: { type: String, required: true }, // 유저의 googleId
  pandora: { type: Mongoose.Schema.Types.ObjectId, ref: 'Pandora', required: true }, // PandoraDB ID
  failCount: { type: Number, required: true, default: 0 },
  restrictedUntil: { type: Date, requried: true, default: null }, 
  unsealedQuestionIndex: { type: Number, required: false, default: 0 }, // 모든 문제를 해결한 경우 null값을 가진다
  unboxing: { type: Boolean, required: true, default: false },
}, { timestamps: true });

setupSchemaVirtuals(recordSchema);
const Record = Mongoose.model('Record', recordSchema);

/**
 * [records 탐색]
 * 조건: pandoraId 일치 (pandora: string 이지만 자동으로 obecjtId로 변환됨)
 */
export async function findRecordsByPandoraId(pandora) {
  const records = await Record.find({ pandora: pandora }).exec();

  return records.map(record => record.toObject());
}

/**
 * [새로운 record 생성]
 */
export async function create(challenger, pandora) {
  const newRecord = new Record({
    challenger: challenger,
    pandora: pandora,
  });

  const savedRecord = await newRecord.save();

  return savedRecord.toObject();
}

/**
 * [단일 record]
 * challengerId + pandoraId 가 일치하는 record를 찾아 반환한다.
 * record를 찾지 못하면 null을 반환한다.
 */
export async function findRecord(challenger, pandora) {
  return Record.findOne({ challenger: challenger, pandora: pandora }).exec();
}

/**
 * [record 통합 업데이트]
 * challengerId + pandoraId 에 해당하는 record를 업데이트 한다.
 * 업데이트 된 record를 반환한다(new: true)
 */
export async function update(challenger, pandora, updates) {
  const updatedRecord = await Record.findOneAndUpdate(
    { challenger: challenger, pandora: pandora },
    { $set: updates },
    { new: true, runValidators: true }
  ).exec();

  return updatedRecord.toObject();
}
