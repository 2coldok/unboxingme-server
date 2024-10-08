import * as recordDB from '../data/record.js';
import { mInitialRiddleIneligible, mInitialRiddlePenalty } from '../mold/unboxing.js';
import { failResponse, successResponse } from '../response/response.js';
import { isPenaltyPeriod } from '../util/date.js';

/**
 * [record 기록이 존재하면 엔드포인트로, 없다면 404 + reason: 'NOT_FOUND_RECORD'를 통해 클라이언트가 record post요청 하도록 유도]
 * 1. record 존재하지 않으면, reason: 'NOT_FOUND_RECORD'를 통해 POST /unboxing/pandora/:id/riddle api 유도
 * 2. 패널티 기간일 경우, reason: 'PENELTY_PERIOD' 반환
 * 3. 풀이를 완료한 record일 경우, reason: 'SOLVED' 반환
 */
export async function validateChallengeableRecordForInitialRiddle(req, res, next) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    const record = await recordDB.findMyRecordOfPandora(googleId, uuid);
    if (!record) {
      const data = mInitialRiddleIneligible('NOT_FOUND_RECORD');
      return successResponse(res, 200, data);
    }

    if (record.unboxing) {
      return failResponse(res, 403, null, '비정상 접근: 이미 풀이가 완료된 record 소유자 입니다.');
    }

    if (isPenaltyPeriod(record.restrictedUntil)) {
      const data = mInitialRiddlePenalty(record.failCount, record.restrictedUntil);
      return successResponse(res, 200, data);
    }

    req.record = record;
    return next();
  } catch (error) {
    console.error(error);
    return failResponse(res, 500);
  }
}

/**
 * [checkRecordExists 에서 404 + reason: 'NOT_FOUND_RECORD' 응답을 받았을 경우 여기서 record를 생성해줌]
 * 1. record가 이미 존재하는 경우 409 반환 (악성유저. TEST 해보기)
 */
export async function createInitialRecord(req, res, next) {
  try {
    const googleId = req.googleId;
    const uuid = req.params.id;

    // Record DB 레벨에서 고유한 조합을 보장하지만 보험으로 둠. 추후 test를 통해 제거 여부 결정 (테스트 꼭 하기)
    const record = await recordDB.findMyRecordOfPandora(googleId, uuid);
    if (record) {
      return failResponse(res, 409, null, '비정상 접근: record 중복 생성 시도');
    }
    const createdRecord = await recordDB.create(googleId, uuid);
    req.record = createdRecord;
    return next();
  } catch (error) {
    // challenger, googleId 조합이 동일한 record를 중복 생성하려는 경우.
    if (error.code === 11000) {
      return failResponse(res, 409, null, 'record 중복 생성 오류');
    }
    console.error(error);
    return failResponse(res, 500);
  }
}

/**
 * [정답을 제출할때, 유요한 record인지 검증한다.]
 * 
 * 1. 제출한 정답에 대한 문제가 올바른 index인지
 * 2. record가 존재하는지
 * 3. 풀이를 완료한 record가 아닌지
 * 4. 패널티 기간이 아닌지
 */
export async function validateChallengeableRecordForNextRiddle(req, res, next) {
  try {
    const googleId = req.googleId;
    const uuid = req.params.id;
    const record = await recordDB.findMyRecordOfPandora(googleId, uuid);

    if (!record) {
      return failResponse(res, 404, null, '[비정상 요청] record가 존재하지 않습니다.');
    }

    if (record.unboxing) {
      return failResponse(res, 403, null, '[비정상 요청] 이미 완료된 record 입니다.');
    }
    
    if (isPenaltyPeriod(record.restrictedUntil)) {
      return failResponse(res, 403, null, '[비정상 요청] 패널티 기간입니다.');
    }
    console.log('*******Middleware******');
    console.log(record);
    console.log('******************')
    console.log('다음문제 제출에 결격사유가 없는 record');

    req.record = record;
    return next();
  } catch (error) {
    console.error(error);
    return failResponse(res, 500);
  }
}

/**
 * [record 차원에서 해당 판도라의 solver인지 확인한다]
 */
export async function validateIsSolver(req, res, next) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    const record = await recordDB.findMyRecordOfSolver(googleId, uuid);
    if (!record) {
      return failResponse(res, 404, null, 'solver의 record가 아닙니다.');
    }

    req.record = record;
    return next();
  } catch (error) {
    return failResponse(res, 500);
  }
}

/**
 * [나의 판도라 수정 또는 삭제시 수정할 판도라와 관련된 record를 모두 삭제한다]
 */
export async function deleteAllRecordsOfMyPandora(req, res, next) {
  try {
    const uuid = req.params.id;
    const totalDeletedRecords = await recordDB.deleteRecordsByPandora(uuid);
    
    req.totalDeletedRecords = totalDeletedRecords;
    return next();
  } catch (error) {
    return failResponse(res, 500, null, '수정/삭제할 판도라의 record 삭제에 실패했습니다. 판도라는 비활성화 상태로 유지됩니다.');
  }
}
