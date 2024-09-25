import Record from "../model/record.js";

/**
 * [ challenger + pandora로 나의 record를 반환한다 ]
 * 
 * 탐색실패: null
 */
export async function findMyRecordOfPandora(challenger, pandora) {
  const record = await Record
    .findOne({ challenger: challenger, pandora: pandora })
    .select('-_id challenger pandora failCount restrictedUntil unsealedQuestionIndex unboxing')
    .lean()
    .exec();

  return record;  
}

/**
 * [ 새로운 record 생성하여 반환 ]
 * 
 * 생성실패: error
 */
export async function create(challenger, pandora) {
  const newRecord = new Record({
    challenger: challenger,
    pandora: pandora,
  });

  const savedRecord = await newRecord.save();

  return {
    challenger: savedRecord.challenger,
    pandora: savedRecord.pandora,
    failCount: savedRecord.failCount,
    restrictedUntil: savedRecord.restrictedUntil,
    unsealedQuestionIndex: savedRecord.unsealedQuestionIndex,
    unboxing: savedRecord.unboxing
  };
}

/**
 * [solver의 record를 반환한다]
 */
export async function findMyRecordOfSolver(challenger, pandora) {
  const record = await Record
    .findOne({ challenger: challenger, pandora: pandora, unboxing: true })
    .select('-_id challenger pandora failCount restrictedUntil unsealedQuestionIndex unboxing')
    .lean()
    .exec();

  return record;  
}
