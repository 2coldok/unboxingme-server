import * as pandoraDB from '../data/pandora.js';

/**
 * Client Type: PandoraSearchResult
 * Response
 * id: string
 * title: string
 * description: string
 * createdAt: ISO String
 * updatedAt: ISO String
 * viewCount: number
 */
export async function getPandorasByKeywordForSearcher(req, res) {
  const keyword = req.query.keyword;
  const pandoras = await pandoraDB.findActivePandorasByKeywordForSearcher(keyword); // 없을 경우 빈 배열 []을 반환한다
  if (!pandoras) {
    return res.status(404).json({ message: 'pandoraDB.findActivePandorasByKeyword 오류' });
  }
  
  return res.status(200).json(pandoras);
}

/**
 * Client Type: PandoraCover
 * Response
 * id: string
 * writer: string
 * title: string
 * description: string
 * totalProblems: number
 * maxOpen: number
 * openCount: number
 * viewCount: number
 * firstQuestion: string
 * firstHint: string
 * createdAt: ISO String
 * updatedAt: ISO String
 */
export async function getPandoraCoverByIdForChallenger(req, res) {
  const pandoraId = req.params.id;
  const pandora = await pandoraDB.findActivePandoraByIdForChallenger(pandoraId); // 없을 경우 null을 반환한다.
  if (pandora === null) {
    return res.status(404).json({ message: '해당 Id의 판도라를 찾을 수 없습니다.' });
  }

  return res.status(200).json({
    id: pandora.id,
    writer: pandora.writer,
    title: pandora.title,
    description: pandora.description,
    totalProblems: pandora.totalProblems,
    maxOpen: pandora.maxOpen,
    openCount: pandora.openCount,
    viewCount: pandora.viewCount,
    firstQuestion: pandora.problems[0].question,
    firstHint: pandora.problems[0].hint,
    createdAt: pandora.createdAt,
    updatedAt: pandora.updatedAt
  });
}

/**
 * Client: 판도라 상자 만들기
 * <body>
 * writer: string
 * title: string
 * description: string
 * keywords: [string]
 * maxOpen: number(제한이 없을경우 -1)
 * problems: [{question: string, hint: string, answer: string}]
 * cat: string
 */
/**
 * <Response>
 * id: string
 * writer: string
 * title: string
 * description: string
 * keywords: [string]
 * maxOpen: number
 * problems: [{ question: string, hint: string, answer: string }]
 * cat: string
 * active: boolean
 * openCount: number
 * viewCount: number
 * totalProblems: number
 * createdAt: ISO String
 * updatedAt: ISO String
 */
export async function createPandora(req, res) {
  const submit = req.body;
  const pandoraData = {
    ...submit,
    maker: req.userId,
    active: true,
    openCount: 0,
    viewCount: 0,
    totalProblems: submit.problems.length,
  }
  const newPandora = await pandoraDB.create(pandoraData);
  if (newPandora) {
    res.status(201).json(newPandora);  
  } else {
    res.status(400).json({ message: '판도라 상자 만들기 실패!' });
  }
}

/**
 * 
 */
export async function getMyPandoras(req, res) {
  const makerId = req.googleId;
  const pandoras = await pandoraDB.findPandorasByMaker(makerId);
  if (pandoras.length === 0) {
    res.status(400).json({ message: '해당 유저가 만든 판도라의 상자가 없습니다' });
  } else {
    res.status(200).json(pandoras);
  }
}

export async function getElpis(req, res) {
  const pandoraId = req.params.id;
  const pandora = await pandoraDB.findCat(pandoraId);

  if (pandora.cat) {
    res.status(200).json({ elpis: pandora.cat });  
  } else {
    res.status(400).json({ message: 'pandora.cat이 존재하지 않음' });
  } 
}
