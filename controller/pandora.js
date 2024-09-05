import * as pandoraDB from '../data/pandora.js';
import * as statsDB from '../data/stats.js';
import { generateKoreanOneToFiveChars, generateUniqueHashValue } from '../domain/UniqueKoreanLabel.js';
import { formatDateToString } from '../util/date.js';

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
 * maxOpen: number(제한이 없을경우 -1)
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
 * solverAlias: string
 * solvedAt: string
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

    const formattedPandoras = pandoras.map((pandora) => ({
      ...pandora,
      solvedAt: pandora.solvedAt ? formatDateToString(pandora.solvedAt) : null,
      createdAt: formatDateToString(pandora.createdAt),
      updatedAt: formatDateToString(pandora.updatedAt),
    }));
      
    return res.status(200).json(formattedPandoras);
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] [controller-pandora.js] [getMyPandoras]' });
  }
}

/**
 * [Response]
 * elpis: string
 * 
 * greenroom 을 통해 최초로 문제를 해결한 solver에 대해서 최초 한번만 확인할 수 있다.
 * 열람자가 재확인을 하고자 한다면 마이페이지에서 다른 api를 통해 열람하도록함
 */
export async function getElpisFOnlyFirstSolver(req, res) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    const { solverAlias } = req.body;

    const pandora = await pandoraDB.findPandoraFOnlyFirstSolver(uuid);
    if (!pandora) {
      return res.status(404).json({ message: '판도라를 찾을 수 없습니다.' });
    }

    // solver 의 googleId와 사용자의 googleId 가 일치하다면, 그리고
    // isCatUncovered false + solverAlias=null 조건을 추가해 greenroom에서 최초로 열람한 이후에는 같은 곳에서 또 열람이 안됨 (재열람은 마이페이지에서 구현)
    if (pandora.solver === googleId && !pandora.isCatUncovered && !pandora.solverAlias) {
      const updates = {
        solverAlias: solverAlias,
        isCatUncovered: true
      };

      // active: false, isCatUncovered: false 인 판도라를 찾아서 업데이트한다. (문제를 다 푼순간 active: false인 상태임으로)
      // isCatUncovered를 true로 업데이트하기
      const updatedPandora = await pandoraDB.updateInactivePandora(uuid, updates); 
      if (!updatedPandora) {
        return res.status(404).json({ message: '[SERVER] 업데이트할 판도라를 찾지 못했습니다.(active: false, isCatUncovered: false 조건 미성립)' });
      }
      return res.status(200).json({ elpis: pandora.cat });
    } else {
      return res.status(403).json({ message: 'solver가 아니거나 greenroom에서 이미 열람 했습니다. 재 열람은 마이페이지에서..' });
    }
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] [data-pandora] [findPandoraFOnlyFirstSolver]' });
  }
}
