import * as pandoraDB from '../data/pandora.js';
import * as dashboardDB from '../data/dashboard.js';
import { failResponse } from '../response/response.js';
import { mInitialRiddleStatus } from '../mold/unboxing.js';

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
      const data = mInitialRiddleStatus('status', 'INACTIVE');
      return failResponse(res, 404, data, '판도라가 비활성화 상태여서 찾을 수 없습니다.');
    }

    if(pandora.solver) {
      const data = mInitialRiddleStatus('status', 'SOLVED');
      return failResponse(res, 403, data, '이미 판도라 풀이자가 존재합니다.');
    }

    // 판도라 생성자가 수수께끼를 도전하려고 할 경우
    const googleId = req.googleId;
    if (pandora.maker === googleId) {
      const data = mInitialRiddleStatus('status', 'MINE');
      return failResponse(res, 403, data, '자신의 수수께끼는 도전할 수 없습니다.');
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
