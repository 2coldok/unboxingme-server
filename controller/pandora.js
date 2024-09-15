import * as pandoraDB from '../data/pandora.js';
import * as statsDB from '../data/stats.js';
import { generateKoreanOneToFiveChars, generateUniqueHashValue } from '../domain/UniqueKoreanLabel.js';

/** 
 * [Response 200]
 * uuid: string
 * writer: string
 * title: string
 * description: string
 * coverViewCount: number
 * createdAt: ISO String
 * updatedAt: ISO String
 *
 * [(없을 경우)Response 200]
 * []
 */
export async function getPandorasFSearchResult(req, res) {
  try {
    const keyword = req.query.keyword;
    const pandoras = await pandoraDB.findPandorasFSearchResult(keyword);
  
    return res.status(200).json(pandoras);
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] [data-pandora] [findPandorasFSearchResult]' });
  }
}

/**
 * [Response]
 * uuid: string
 * label: string
 * writer: string
 * title: string
 * description: string
 * firstQuestion: string
 * firstHint: string
 * totalProblems: number
 * coverViewCount: number
 * createdAt: ISO String
 * updatedAt: ISO String
 */
export async function getPandoraFCover(req, res) {
  try {
    const uuid = req.params.id;
    const cookieName = `viewed_cover_${uuid}`;
    const hasViewed = req.cookies[cookieName];

    const pandora = hasViewed
      ? await pandoraDB.findPandoraFCover(uuid)
      : await pandoraDB.findPandoraFCoverWithIncreasedViewCount(uuid);

    if (!pandora) {
      return res.status(404).json({ message: '해당 Id의 활성화된 판도라 표지를 찾을 수 없습니다.' });
    }

    if (!hasViewed) {
      console.log('쿠기가 존재하지 않네요 조회수 올리고 쿠키 저장할게요');
      res.cookie(cookieName, true, { maxAge: 1000 * 60 * 60, httpOnly: true });
    } else {
      console.log('쿠키가 존재하네요 조회수는 그대로 둘게요');
    }

    return res.status(200).json(pandora);
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] [data-pandora] [findPandoraFCover]' });
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
 * 
 * [Response]
 * label: string
 * uuid: string
 * writer: string
 * title: string
 * description: string
 * keywords: [string]
 * problems: [{question: string, hint: string, answer: string}]
 * totalProblems: number
 * cat: string
 * coverViewCount: number
 * active: boolean
 * createdAt: string
 * updatedAt: string
 */
export async function createNewPandora(req, res) {
  try {
    const submissionData = req.body;

    const updatedStats = await statsDB.updateTotalPandoras();
    console.log(`너는 ${updatedStats.totalPandoras}번째 판도라야`);
    if (!updatedStats) {
      return res.status(500).json({ message: '[SERVER] stats collection 업데이트 실패' });
    }
    const hashedStringNumber = generateUniqueHashValue(String(updatedStats.totalPandoras));
    const newPandoraLabel = generateKoreanOneToFiveChars(BigInt(hashedStringNumber));
    console.log(`발급된 label: ${newPandoraLabel}`);
    

    const pandoraData = {
      label: newPandoraLabel,
      maker: req.userId,
      totalProblems: submissionData.problems.length,
      ...submissionData
    }

    const newPandora = await pandoraDB.createPandora(pandoraData);
    res.status(201).json(newPandora);
  } catch (error) {
    console.error('dd', error);
    return res.status(500).json({ message: '[SERVER] [data-pandora] [createPandora]' });
  }
}

/**
 * [Response]
 * label: string
 * uuid: string
 * writer: string
 * title: string
 * description: string
 * keywords: [string]
 * problems: [{question: string, hint: string, answer: string}]
 * totalProblems: number
 * cat: string
 * coverViewCount: number
 * solverAlias: string | null
 * solvedAt: string | null
 * isCatUncovered: boolean
 * active: boolean
 * createdAt: string
 * updatedAt: string
 * 
 * [(없을 경우)Response]
 * []
 */
export async function getMyPandoras(req, res) {
  try {
    const makerId = req.googleId;
    const pandoras = await pandoraDB.findMyPandoras(makerId);
    if (pandoras.length === 0) {
      return res.status(200).json(pandoras);
    }
      
    return res.status(200).json(pandoras);
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] [controller-pandora.js] [getMyPandoras]' });
  }
}

/**
 * [수정시 데이터를 업로드 하기위해 나의 단일 판도라 불러오기]
 * [response]
 * writer
 * title
 * description
 * keywords
 * problems
 * cat
 */
export async function getMyPandoraFEdit(req, res) {
  try {
    const pandoraUuid = req.params.id;
    const googleId = req.googleId;
    const pandora = await pandoraDB.findMyPandoraFEdit(pandoraUuid, googleId);
    if (!pandora) {
      return res.status(404).json({ message: '[SERVER] 해당 판도라를 찾을 수 없음' });
    }

    return res.status(200).json(pandora);
  } catch (error) {
    console.error('getMyPandora error', error);
    return res.status(500).json({ message: '[SERVER] getMyPandora' });
  }
}

/**
 * 삭제
 */

export async function deleteMyPandora(req, res) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;

    const result = await pandoraDB.deletePandora(uuid, googleId);
    if (!result) {
      return res.status(404).json({ message: '[SERVER] deleteMyPandora 삭제하려는 판도라를 찾을 수 없습니다.' });
    }
    
    return res.status(204).end();

  } catch (error) {
    console.error('오류', error);
    return res.status(500).json({ message: '[SERVER] 서버오류. deleteMyPandora' });
  }
}

/**
 * 수정
 * 
 * [submissionData]
 * writer
 * title
 * description
 * keywords
 * problems
 * cat
 * 
 * 반환하지 않음
 */
export async function relaceMyPandora(req, res) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    const submissionData = req.body;
    const isReplaced = await pandoraDB.replacePandora(uuid, googleId, submissionData);

    if (!isReplaced) {
      return res.status(404).json({ message: '[SERVER] 수정할 판도라를 찾을 수 없습니다.' })
    }

    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] 서버 오류' });
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