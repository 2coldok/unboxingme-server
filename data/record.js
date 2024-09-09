import Record from "../model/record.js";
import { transformData } from "../database/database.js";
import { COLLECTION_NAME } from "../constant/data.js";
import { formatDateToString } from "../util/date.js";
// [default]
// _id 제거
// createdAt, updatedAt 을 ISO string으로 변경

/**
 * [records 탐색]
 * 조건: pandoraUuid 일치
 */
export async function findRecordsByPandoraUuid(pandoraUuid) {
  const records = await Record
    .find({ pandora: pandoraUuid })
    .lean()
    .exec(); // 없으면 빈배열 반환

  if (records.length === 0) {
    return records;
  }
  
  const filtedRecords = transformData(records, COLLECTION_NAME.record);

  return filtedRecords;
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

  const filtedRecord = transformData(savedRecord.toObject(), COLLECTION_NAME.record);

  return filtedRecord;
}

/**
 * [단일 record]
 * challengerGoogleId + pandoraUuid 가 일치하는 record를 찾아 반환한다.
 * record를 찾지 못하면 null을 반환한다.
 */
export async function findRecord(challengerGoogleId, pandoraUuid) {
  const record = await Record
    .findOne({ challenger: challengerGoogleId, pandora: pandoraUuid })
    .lean()
    .exec();
  
  if (!record) {
    return null;
  }

  const filtedRecord = transformData(record, COLLECTION_NAME.record);
  
  return filtedRecord;
}

/**
 * 
 * 삭제: challenger
 */
export async function findRecords(pandoraUuid) {
  const records = await Record
    .find({ pandora: pandoraUuid })
    .lean()
    .exec();// 없으면 빈배열
  
  if (!records) {
    return records;
  }

  const filtedRecords = transformData(records, COLLECTION_NAME.record);
  // 보안을 위해 challenger는 제거 + restrictedUntil은 string으로만 사용됨으로 string으로 변환
  const result = filtedRecords.map(({ challenger, restrictedUntil, ...rest }) => {
    return { restrictedUntil: formatDateToString(restrictedUntil), ...rest };
  });

  return result;
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
  
  if (!updatedRecord) {
    return null;
  }
  
  const filtedRecord = transformData(updatedRecord, COLLECTION_NAME.record);

  return filtedRecord;
}
