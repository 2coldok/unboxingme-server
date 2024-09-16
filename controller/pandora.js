import * as pandoraDB from '../data/pandora.js';
import * as statsDB from '../data/stats.js';
import { generateKoreanOneToFiveChars, generateUniqueHashValue } from '../domain/UniqueKoreanLabel.js';
import * as pandoraMold from '../mold/pandora.js';

import { successResponse, failResponse } from '../response/response.js';

export async function getPandorasFSearchResult(req, res) {
  try {
    const keyword = req.query.keyword;
    const pandoras = await pandoraDB.findPandorasFSearchResult(keyword);
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
    const pandoras = await pandoraDB.findMyPandoras(googleId);
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
      return failResponse(res, 500, '총 판도라 개수 업데이트를 실패했습니다.');
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
      return failResponse(res, 500, '판도라 생성에 실패했습니다.');
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
    const deleteResult = await pandoraDB.deletePandora(uuid, googleId);

    if (!deleteResult) {
      return failResponse(res, 404, '삭제할 판도라를 찾지 못했습니다.');
    }
    
    return successResponse(res, 200, null, '삭제 성공');
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
export async function relaceMyPandora(req, res) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    const submit = req.body;
    const isReplaced = await pandoraDB.replaceMyPandora(uuid, googleId, submit);

    if (!isReplaced) {
      return failResponse(res, 404, '수정할 판도라를 찾지 못했습니다.');
    }

    return successResponse(res, 200, null, '성공적으로 수정했습니다.');
  } catch (error) {
    return failResponse(res, 500);
  }
}









/**
 * 
 * solver alias 가 존재하는지 않하는지 오직 해당 판도라 solver에게 반환한다.
 */
export async function getSolverAliasStatus(req, res) {
  try {
    const pandora = req.pandora;
    console.log(pandora.solverAlias);
    
    // solverAlias가 존재 할경우
    if (pandora.solverAlias) {
      return res.status(200).json({ isSolverAlias: true });
    }

    // solverAlias가 존재하지 않을 경우
    return res.status(200).json({ isSolverAlias: false })
  } catch (error) {
    return res.status(500).json({ message: '[SERVER ERROR]' });
  }
}

/**
 * solverAlias를 최초로 등록하는 작업
 */
export async function registerSolverAlias(req, res) {
  try {
    const uuid = req.params.id;
    const { solverAlias } = req.body;
    const updates = {
      solverAlias: solverAlias
    };
    const updatedSolverAlias = await pandoraDB.updateSolverAlias(uuid, updates);
    if (!updatedSolverAlias) {
      return res.status(404).json({ message: '[SERVER] [updateSolverAlias] 업데이트할 판도라를 찾지 못했습니다.' });
    }
    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ message: '[SERVER ERROR]' });
  }
}

/**
 * [Response]
 * elpis: string
 * 
 * isCatUncovered를 true로 업데이트하고, elpis를 반환한다.
 */
export async function getElpis(req, res) {
  try {
    const { cat, isCatUncovered } = req.pandora;

    console.log(cat);

    if (isCatUncovered) {
      return res.status(200).json({ elpis: cat });
    }

    const uuid = req.params.id;
    const googleId = req.googleId;
    const updates = {
      isCatUncovered: true
    };
    // isCatUncovered를 true로 업데이한다.
    const updatedPandora = await pandoraDB.updatePandoraFElpisAccess(uuid, googleId, updates);
    if (!updatedPandora) {
      return res.status(404).json({ message: '[SERVER] 업데이트할 판도라를 찾지 못했습니다' });
    }

    return res.status(200).json({ elpis: cat });
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] [data-pandora] [findPandoraFOnlyFirstSolver]' });
  }
}