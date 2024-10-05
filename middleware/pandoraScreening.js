import * as pandoraDB from '../data/pandora.js';
import * as dashboardDB from '../data/dashboard.js';
import { failResponse, successResponse } from '../response/response.js';
import { mInitialRiddleIneligible } from '../mold/unboxing.js';

/**
 * [도전할 수 있는 판도라인지 검증]
 * 1. uuid. 존재하는 uuid인지?
 * 2. active. 판도라 활성화가 되어 있는지?
 * 3. solver. 풀이자가 존재 하지 않는지
 * 4. maker. 판도라 생성자가 아닌지
 */ 
export async function validateChallengeablePandora(req, res, next) {
  try {
    const uuid = req.params.id;
    const pandora = await pandoraDB.findChallengeablePandora(uuid);
    if (!pandora) {
      const data = mInitialRiddleIneligible('INACTIVE');
      return successResponse(res, 200, data);
    }

    if (pandora.solver) {
      const data = mInitialRiddleIneligible('SOLVED');
      return successResponse(res, 200, data);
    }

    // 판도라 생성자가 수수께끼를 도전하려고 할 경우
    const googleId = req.googleId;
    if (pandora.maker === googleId) {
      const data = mInitialRiddleIneligible('MINE');
      return successResponse(res, 200, data);
    }

    // 안전을 위해 maker, solver 제거하고 next
    const { maker, solver, ...rest } = pandora;

    req.pandora = rest;
    return next();
  } catch (error) {
    console.error(error);
    return failResponse(res, 500);
  }
}

/**
 * [dashboard]
 * [내가 만든 판도라인지 검증]
 */
export async function validateIsMyPandora(req, res, next) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    const pandora = await dashboardDB.findMyPandoraForLog(uuid, googleId);
    if (!pandora) {
      return failResponse(res, 404, null, '판도라가 존재하지 않거나, 내가 만든 판도라가 아닙니다.');
    }

    req.pandora = pandora;
    return next();
  } catch (error) {
    console.error(error);
    return failResponse(res, 500);
  }
}

/**
 * [판도라 수정에 들어가기 전 해당 판도라가 나의 판도라이고 solver가 존재하지 않는 활성상태의 판도라를 비활성화로 잠시 변경한다]
 */
export async function validateIsMyNotSolvedPandora(req, res, next) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    const isUpdated = await pandoraDB.makeInactiveMyPandora(uuid, googleId); // 나의 판도라 비활성화 시키기
    if (!isUpdated) {
      return failResponse(res, 404, null, '조건에 만족하는 판도라를 찾지 못했습니다. uuid: uuid, maker: maker, active: true, solver: null');
    }
    return next();
  } catch (error) {
    return failResponse(res, 500);
  }
}
