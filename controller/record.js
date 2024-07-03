import * as recordDB from '../data/record.js';

/**
 * <Client>
 * body
 * pandoraId: string
 * 
 * <Response>[]
 * id: string
 * challenger:
 * pandora
 * failCount
 * restrictedUntil
 * unsealedQuestionIndex
 * unboxing
 * updatedAt
 * createdAt
 * 
 * records 가 없을경우 (해당 판도라에 접근한 기록이 없을 경우) 빈 배열을 반환한다
 */
export async function getRecordsOfPandora(req, res) {
  const { pandoraId } = req.body;

  const records = await recordDB.findRecordsByPandoraId(pandoraId);

  return res.status(200).json(records);
}
