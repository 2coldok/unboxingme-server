import * as dashboardDB from '../data/dashboard.js';
import { failResponse, successResponse } from '../response/response.js';
import { mMyChallenges, mMyConqueredPandoras, mMyPandoraLog } from '../mold/dashboard.js';

/**
 * 
 */
export async function getMyPandoraLog(req, res) {
  try {
    const pandora = req.pandora;
    const uuid = req.params.id;
    const records = await dashboardDB.findRecordsOfMyPandora(uuid);
    const log = { ...pandora, records: records };

    const data = mMyPandoraLog(log);
    return successResponse(res, 200, data);
  } catch (error) {
    console.error(error);
    return failResponse(res, 500);
  }
}

export async function getMyChallenges(req, res) {
  try {
    const googleId = req.googleId;
    const { page } = req.body;
    const records = await dashboardDB.findMyRecordsByPage(googleId, page, 10);
    if (records.length === 0) {
      return successResponse(res, 200, [], '내가 도전중인 판도라가 없습니다.');
    }

    const pandoraUuids = records.map(record => record.pandora);
    const pandoras = await dashboardDB.findPandorasByMyChallenges(pandoraUuids);
    if (pandoras.length === 0) {
      return successResponse(res, 200, [], '내가 도전중인 판도라들을 모두 찾을 수 없습니다.');
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
    const { page } = req.body;
    const pandoras = await dashboardDB.findMyConqueredPandoras(googleId, page, 10);
    if (pandoras.length === 0) {
      return successResponse(res, 200, [], '내가 풀이를 완료한 판도라가 존재하지 않습니다.');
    }
    
    const data = mMyConqueredPandoras(pandoras);
    return successResponse(res, 200, data);
  } catch (error) {
    console.error(error);
    return failResponse(res, 500);
  }  
}
