import * as pandoraDB from '../data/pandora.js';
import * as recordDB from '../data/record.js';
import * as statsDB from '../data/stats.js';
import { generateKoreanOneToFiveChars, generateUniqueHashValue } from '../domain/UniqueKoreanLabel.js';
import * as pandoraMold from '../mold/pandora.js';

import { successResponse, failResponse } from '../response/response.js';

export async function getPandorasFSearchResult(req, res) {
  try {
    const { keyword, page } = req.query;
    const pandoras = await pandoraDB.findPandorasBySearchKeyword(keyword, page);
    const data = pandoraMold.mPandorasSearchResult(pandoras);

    return successResponse(res, 200, data);
  } catch (error) {
    console.error('getPandorasFSearchResult', error);
    return failResponse(res, 500);
  }
}

export async function getPandoraFCover(req, res) {
  try {
    const uuid = req.params.id;
    const cookieName = `viewed_cover_${uuid}`;
    const hasViewed = req.cookies[cookieName];

    const pandora = hasViewed
      ? await pandoraDB.findPandoraFCover(uuid)
      : await pandoraDB.findPandoraFCoverWithIncreasedViewCount(uuid);
    
    const data = pandoraMold.mPandoraCover(pandora);
    if (!hasViewed) {
      res.cookie(cookieName, true, { maxAge: 1000 * 60 * 60, httpOnly: true });
    }

    return successResponse(res, 200, data);
  } catch (error) {
    return failResponse(res, 500);
  }
}

export async function getMyPandoras(req, res) {
  try {
    const googleId = req.googleId;
    const { page } = req.query;
    const pandoras = await pandoraDB.findMyPandoras(googleId, page);
    const data = pandoraMold.mMyPandoras(pandoras);
      
    return successResponse(res, 200, data);
  } catch (error) {
    return failResponse(res, 500);
  }
}

export async function getMyPandoraFEdit(req, res) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    const pandora = await pandoraDB.findMyPandoraFEdit(uuid, googleId);
    const data = pandoraMold.mMyPandoraEdit(pandora);

    return successResponse(res, 200, data);
  } catch (error) {
    failResponse(res, 500);
  }
}

/**
 * [req.body]
 * writer: string
 * title: string
 * description: string
 * keywords: [string]
 * problems: [{question: string, hint: string, answer: string}]
 * cat: string
 */
export async function createNewPandora(req, res) {
  try {
    const googleId = req.googleId;
    const submit = req.body;

    // 총 판도라 개수 1 증가 및 증가된 판도라 개수 반환
    let updatedStats;
    try {
      updatedStats = await statsDB.updateTotalPandoras();
      console.log(`******** ${updatedStats.totalPandoras}번째 판도라 *******`);
    } catch (error) {
      return failResponse(res, 500, null, '총 판도라 개수 업데이트를 실패했습니다.');
    }
    
    // 고유 라벨 발급
    const hashedStringNumber = generateUniqueHashValue(String(updatedStats.totalPandoras));
    const newPandoraLabel = generateKoreanOneToFiveChars(BigInt(hashedStringNumber));
    console.log(`******** 발급된 label: ${newPandoraLabel}*******`);
    
    const newPandoraData = {
      label: newPandoraLabel,
      maker: googleId,
      totalProblems: submit.problems.length,
      ...submit
    }

    // 판도라 생성
    try {
      await pandoraDB.createPandora(newPandoraData);
    } catch (error) {
      return failResponse(res, 500, null, '판도라 생성에 실패했습니다.');
    }

    return successResponse(res, 201, null, '판도라 생성 성공');
  } catch (error) {
    return failResponse(res, 500);
  }
}

export async function deleteMyPandora(req, res) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    // 판도라 삭제
    const deletePandoraResult = await pandoraDB.deletePandora(uuid, googleId);
    if (!deletePandoraResult) {
      return failResponse(res, 404, '삭제할 판도라를 찾지 못했습니다.');
    }

    // record 삭제
    const totalDeletedRecords = await recordDB.deleteRecordsByPandora(uuid);
    const data = pandoraMold.mMyPandoraDeleteResult(totalDeletedRecords);
    return successResponse(res, 200, data, '삭제 성공');
  } catch (error) {
    return failResponse(res, 500);
  }
}

/** 
 * [req.body]
 * writer
 * title
 * description
 * keywords
 * problems
 * cat
 */
export async function editMyPandora(req, res) {
  try {
    const totalDeletedRecords = req.totalDeletedRecords;
    const uuid = req.params.id;
    const googleId = req.googleId;
    const submit = req.body;
    const isReplaced = await pandoraDB.replaceMyPandora(uuid, googleId, submit);
    if (!isReplaced) {
      return failResponse(res, 404, '수정할 판도라를 찾지 못했습니다. uuid: uuid, maker: maker, solver: null');
    }

    const data = pandoraMold.mMyPandoraEditResult(totalDeletedRecords);
    return successResponse(res, 200, data, '성공적으로 수정했습니다.');
  } catch (error) {
    return failResponse(res, 500);
  }
}
