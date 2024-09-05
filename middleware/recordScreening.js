import * as recordDB from '../data/record.js';
import { isPenaltyPeriod } from '../util/date.js';

// greenroom진입시 최초 get 요청시 사용
// record 기록이 존재하면 엔드포인트로, 없다면 404 반환하여 프론트에서 record를 생성하는 쪽으로 post요청하도록 유도
export async function screeningExistence(req, res, next) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    
    const record = await recordDB.findRecord(googleId, uuid);
    
    
    if (!record) {
      return res.status(404).json({ message: 'record 가 존재하지 않음' });
    }

    req.record = record;
    return next();
  } catch (error) {
    console.error('Error in screeningExistence middleware:', error);
    return res.status(500).json({ message: '[SERVER] [middleware-recordScreening] [screeningExistence]', error: error.message });
  }
}

// 클라이언트에서 recordScreeningOfExistence 에서 404를 응답받았을 경우 오는 곳
// 우선 record 를 조회해서 확실히 없다는걸 확인 후 새로운 record를 생성하여 엔드포인트로 이동
// 만약 record 데이터가 이미 존재한다면 409 conflict 코드 반환
export async function screeningCreate(req, res, next) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    const record = await recordDB.findRecord(googleId, uuid);

    if (record) {
      return res.status(409).json({ message: 'createRecord : record가 이미 존재하여 conflict 409 반환' });
    }

    const createdRecord = await recordDB.create(googleId, uuid);

    req.record = createdRecord;
    return next();
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] [middleware-recordScreening] [screeningCreate]' });
  }
}

/**
 * 1. request 에 record 객체 추가
 * 2. 비 정상적인 api 접근 처리
 * 3. record존재, unboxing false, unsealedQuestionIndex !== null, 패널티기간 아닐 시에 endpoint로 이동
 * isAuth - (screeningNextProblem) - getNextProblem
 */
export async function screeningNextProblem(req, res, next) {
  try {
    const pandoraId = req.params.id;
    const googleId = req.googleId;
    const record = await recordDB.findRecord(googleId, pandoraId);
    
    // [비 정상적인 api 접근]
    if (!record) {
      return res.status(404).json({ message: '허락되지 않은 접근 : record 기록이 존재하지 않습니다.' }); // setup에서 record를 생성할 것이기 때문. next 버튼을 보여주지 않을 것이기 때문
    }
    if (record.unboxing || record.unsealedQuestionIndex === null) {
      return res.status(404).json({ message: '허락되지 않은 접근 : 이미 unboxing한 판도라의 상자입니다.' }); // setup에서 판단할것이고, next 버튼을 보여주지 않을것이기 때문
    }
    if (isPenaltyPeriod(record.restrictedUntil)) {
      return res.status(403).json({ message: '허락되지 않은 접근 : 패널티 기간입니다' }); // 프론트에서 패널티 확정시 greenroom에서 다른페이지로 라우팅할 것이기 때문
    }

    req.record = record;
    return next();
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] [middleware-recordScreening] [screeningNextProblem]' });
  }
}

/**
 * isAuth - (screeningElpisAccess) - getElpis
 *
 * elpis 데이터 접근하기 위한 record 기록 검사 후 자격이 되면 next
 * 1. unboxing: true
 * 2. unsealedQuestionIndex: null
 * 3. 패널티 기간 아님
 */
export async function screeningElpisAccess(req, res, next) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    const record = await recordDB.findRecord(googleId, uuid);

    if (!record) {
      res.status(404).json({ message: '[지원하지 않는 접근] record가 존재하지 않습니다' });
    }

    const { unboxing, unsealedQuestionIndex, restrictedUntil } = record;
    if (unboxing === true && unsealedQuestionIndex === null && !isPenaltyPeriod(restrictedUntil)) {
      return next();
    }

    return res.status(404).json({ message: 'elpis를 열람하기 위한 record 유효성 검사 실패' });
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] [middleware-recordScreening] [screeningElpisAccess]' });
  }
}
