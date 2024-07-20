import * as recordDB from '../data/record.js';
import { format } from 'date-fns';
import { isBefore } from 'date-fns';

export async function getRecord(req, res) {
  const pandoraId = req.params.id;
  const googleId = req.googleId;

  const record = await recordDB.findRecord(googleId, pandoraId);
  if (record === null) {
    return res.status(200).json({
      failCount: 0,
      restrictedUntil: null,
      unsealedQuestionIndex: 0,
      unboxing: false,
      isRestricted: false,
    });
  }

  res.status(200).json({ 
    failCount: record.failCount,
    restrictedUntil: formatDateToString(record.restrictedUntil),
    unsealedQuestionIndex: record.unsealedQuestionIndex,
    unboxing: record.unboxing,
    isRestricted: isPenaltyPeriod(record.restrictedUntil),
  });
}

function formatDateToString(date) {
  if (date === null) {
    return null;
  }

  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

// 패널티 시간 지났을 시 false반환
// 패널티 시간 안지났을 시 true 반환
function isPenaltyPeriod(restrictedUntilDate) {
  // 패널티 시간이 현재 시간보다 이전인 경우. (패널티 기간이 만료된 경우) 또는 패널티를 아예 받지 않은 상태일 경우(null)
  if (restrictedUntilDate === null || isBefore(restrictedUntilDate, new Date())) {
    return false
  }

  // 아직 현재시간이 패널티 시간보다 이전일 경우(패널티 기간에 속할 경우)
  return true;
}