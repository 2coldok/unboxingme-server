import * as dashboardDB from '../data/dashboard.js';
import { failResponse, successResponse } from '../response/response.js';
import { mMyChallenges, mMyConqueredPandoras, mMyPandoraDetail } from '../mold/dashboard.js';

/**
 * 
 */
export async function getMyPandoraDetail(req, res) {
  try {
    const uuid = req.params.id;
    const pandora = req.pandora;
    const { totalRecords, record } = await dashboardDB.findTopRecordOfMyPandora(uuid)
    
    const data = mMyPandoraDetail(pandora, record, totalRecords);
    return successResponse(res, 200, data);
  } catch (error) {
    console.error(error);
    return failResponse(res, 500);
  }
}

export async function getMyChallenges(req, res) {
  try {
    const googleId = req.googleId;
    // 최대 10개의 기록을 최근에 도전한 순서대로 반환
    const records = await dashboardDB.findMyChallengeRecords(googleId);
    // 도전중인 기록이 아예 없을경우
    if (records.length === 0) {
      return successResponse(res, 200, [], '내가 도전중인 기록이 없습니다.');
    }

    const pandoraUuids = records.map(record => record.pandora);
    const pandoras = await dashboardDB.findPandorasByMyChallenges(pandoraUuids);
    // 기록은 있으나 해당 판도라가 존재하지 않을경우(판도라가 삭제 또는 풀이완료 또는 비공개상태)
    if (pandoras.length === 0) {
      return successResponse(res, 200, [], '기록은 있으나 도전중인 판도라들을 모두 찾을 수 없습니다.');
    }

    const data = mMyChallenges(records, pandoras);
    return successResponse(res, 200, data);
  } catch (error) {
    console.error(error);
    return failResponse(res, 500);
  }
}

export async function getMyConqueredPandoras(req, res) {
  try {
    const googleId = req.googleId;
    const { page } = req.query;
    const { total, pandoras } = await dashboardDB.findMyConqueredPandoras(googleId, page);
    if (total === 0) {
      return successResponse(res, 200, { total: 0, pandoras: [] }, '내가 풀이를 완료한 판도라가 존재하지 않습니다.');
    }
    
    const data = mMyConqueredPandoras(total, pandoras);
    return successResponse(res, 200, data);
  } catch (error) {
    console.error(error);
    return failResponse(res, 500);
  }  
}
