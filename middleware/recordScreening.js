import { isBefore } from 'date-fns';
import * as recordDB from '../data/record.js';

/**
 * record 가 없을경우 record 생성.
 * request 에 record 객체 추가
 * request 에 isPenaltyPeriod boolean 추가
 * 
 * isAuth - (recordScreeningOfSetupInitalGreenroom) - setupInitalGreenroom
 */
export async function recordScreeningOfSetupInitialGreenroom(req, res, next) {
  const pandoraId = req.params.id;
  const googleId = req.googleId;
  const record = await recordDB.findRecord(googleId, pandoraId);

  // record가 없을경우
  if (record === null) {
    const record = await recordDB.create(googleId, pandoraId);
    req.record = record;
    req.isPenaltyPeriod = false;
    console.log('record 생성 후 next..'); //
    return next();
  }

  // record가 있을경우
  req.record = record;
  req.isPenaltyPeriod = isPenaltyPeriod(record.restrictedUntil);
  console.log('record가 있으니 그냥 next..'); //
  return next();
}

/**
 * request 에 record 객체 추가
 * 비 정상적인 api 접근 처리
 * record가 존재하고, unboxing: false, 패널티 기간이 아닐 경우에만 엔드포인트(getNextProblem)로 이동
 * isAuth - (recordScreeningOfNextProblem) - getNextProblem
 */
export async function recordScreeningOfNextProblem(req, res, next) {
  const pandoraId = req.params.id;
  const googleId = req.googleId;
  const record = await recordDB.findRecord(googleId, pandoraId);
  
  // 비 정상적인 api 접근
  if (record !== null && record.unboxing) {
    return res.status(404).json({ message: '허락되지 않은 접근 : 이미 unboxing한 판도라의 상자입니다.' }); // setup에서 판단할것이고, next 버튼을 보여주지 않을것이기 때문
  }
  if (record === null) {
    return res.status(404).json({ message: '허락되지 않은 접근 : record 기록이 존재하지 않습니다.' }); // setup에서 record를 생성할 것이기 때문. next 버튼을 보여주지 않을 것이기 때문
  }
  if (record && isPenaltyPeriod(record.restrictedUntil)) {
    return res.status(403).json({ message: '허락되지 않은 접근 : 패널티 기간입니다' }); // 프론트에서 패널티 확정시 greenroom에서 다른페이지로 라우팅할 것이기 때문
  }

  // 정상적인 api 접근
  if (record && !record.unboxing && !isPenaltyPeriod(record.restrictedUntil) && record.unsealedQuestionIndex !== null) {
    req.record = record;
    console.log('record 기록 있고 패널티 기간 아님. next ..'); 
    return next();
  }

  res.status(404).json({ message: 'DB에서 조회한 record 데이터가 null 이외의 예측할 수 없는 값입니다.' });
}

/**
 * isAuth - (recordScreeningOfElpisAccess) - getElpis
 */
export async function recordScreeningOfElpisAccess(req, res, next) {
  const pandoraId = req.params.id;
  const googleId = req.googleId;
  const record = await recordDB.findRecord(googleId, pandoraId);
  if (!record) {
    res.status(404).json({ message: 'record가 존재하지 않습니다. 잘못된 접근' });
  }

  if (record.unboxing === true && record.unsealedQuestionIndex === null && !isPenaltyPeriod(record.restrictedUntil)) {
    return next();
  }

  res.status(404).json({ message: 'elpis를 열람하기 위한 record 유효성 검사 실패' });
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
