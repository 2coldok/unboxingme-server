import moment from 'moment';
import * as recordDB from '../data/record.js';

export async function recordScreening(req, res, next) {
  const { pandoraId } = req.body;
  const googleId = req.googleId;

  const record = await recordDB.findRecord(googleId, pandoraId);

  if (record !== null && record.unboxing) {
    return res.status(403).json({ message: '이미 unboxing한 판도라의 상자입니다.' });
  }
  
  if (record === null) {
    const record = await recordDB.create(googleId, pandoraId);
    req.record = record;
    console.log('record 가 없어서 record 생성 후 next..'); //
    return next();
  }

  if (record && !isAccessRestrictedByPenalty(record.restrictedUntil)) {
    req.record = record;
    console.log('record 기록 있고 패널티 기간 아님. next ..'); //
    return next();
  }

  if (record && isAccessRestrictedByPenalty(record.restrictedUntil)) {
    console.log('record 기록을 보니 패널티 기간이라 403 반환'); //
    return res.status(403).json({ message: '패널티 기간입니다.' });
  }
  
  res.status(404).json({ message: 'DB에서 조회한 record 데이터가 null 이외의 예측할 수 없는 값입니다.' });
}

// 패널티 시간 안지났을 시 true 반환
// 패널티 시간 지났을 시 false반환
function isAccessRestrictedByPenalty(restrictedUntil) {
  const currentTime = moment();
  const restrictedTime = moment(restrictedUntil);
  
  return currentTime.isBefore(restrictedTime);
}
