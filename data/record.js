import Mongoose from 'mongoose';
import { setupSchemaVirtuals } from '../database/database.js';

const recordSchema = new Mongoose.Schema({
  challenger: { type: String, required: true },
  pandora: { type: Mongoose.Schema.Types.ObjectId, ref: 'Pandora', required: true },
  failCount: { type: Number, required: true },
  restrictedUntil: { type: Date, requried: true }, 
  unsealedQuestionIndex: { type: Number, required: true },
  unboxing: { type: Boolean, required: false },
}, { timestamps: true });

setupSchemaVirtuals(recordSchema);
const Record = Mongoose.model('Record', recordSchema);

export async function findRecord(challengerId, pandoraId) {
  // record가 없으면 null을 반환한다.
  return Record.findOne({ challenger: challengerId, pandora: pandoraId }).exec();
}

// updates : failCount, restrictedUntil, unsealedQuestionIndex, unboxing
// record 데이터를 업데이트하고 업데이트된 기록을 반환한다.
export async function update(challengerId, pandoraId, updates) {
  const record = await Record.findOne({ challenger: challengerId, pandora: pandoraId });
  
  if (updates.failCount !== undefined) {
    record.failCount = updates.failCount;
  }
  if (updates.restrictedUntil !== undefined) {
    record.restrictedUntil = updates.restrictedUntil;
  }
  if (updates.unsealedQuestionIndex !== undefined) {
    record.unsealedQuestionIndex = updates.unsealedQuestionIndex;
  }
  if (updates.unboxing !== undefined) {
    record.unboxing = updates.unboxing;
  }

  const updatedRecord = await record.save();

  return updatedRecord;
}

export async function create(challengerId, pandoraId) {
  const newRecord = new Record({
    challenger: challengerId,
    pandora: pandoraId,
    failCount: 0,
    restrictedUntil: new Date(),
    unsealedQuestionIndex: 0,
    unboxing: false,
  });

  const savedRecord = await newRecord.save();

  return savedRecord;
}
