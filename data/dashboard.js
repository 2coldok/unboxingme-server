import { PAGE_LIMIT_ITEMS } from "../constant/page.js";
import Pandora from "../model/pandora.js";
import Record from "../model/record.js";

/**
 * [내가 만든 판도라를 반환한다][도전현황에 함께 보낼 데이터]
 * 
 * 탐색실패: null
 */
export async function findMyPandoraForLog(uuid, maker) {
  const fieldsToSelect = [
    '-_id',
    'label',
    'totalProblems',
    'coverViewCount',
    'solverAlias',
    'solvedAt',
    'isCatUncovered',
    'active'
  ].join(' ');

  const pandora = await Pandora
    .findOne({ uuid: uuid, maker: maker })
    .select(fieldsToSelect)
    .lean()
    .exec();
  
  return pandora;
}

/**
 * 
 * 
 * 탐색실패: []
 */
export async function findRecordsOfMyPandora(pandora, page) {
  const limit = PAGE_LIMIT_ITEMS.log;
  const skip = (page - 1) * limit;

  const total = await Record
    .countDocuments({ pandora: pandora });

  const records = await Record
    .find({ pandora: pandora })
    .select('-_id failCount restrictedUntil unsealedQuestionIndex unboxing createdAt updatedAt')
    .sort({ unsealedQuestionIndex: -1, updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  
  return { total, records };
}

/**
 * [나의 구글 아이디로 내가 아직 도전중인 records를 최대 10개만 찾는다]
 * 
 */
export async function findMyChallengeRecords(challenger) {
  const limit = PAGE_LIMIT_ITEMS.challenges;

  const records = await Record
    .find({ challenger: challenger, unboxing: false })
    .select('-_id pandora failCount restrictedUntil unsealedQuestionIndex createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean()
    .exec();
  
  return records;
}

/**
 * [내가 도전중인 판도라]
 *  
 * uuids: 내가 도전중인 모든 판도라 id 배열. updated: -1로 sorted된 최대 길이 10
 */
export async function findPandorasByMyChallenges(uuids) {
  // uuids를 기반으로 조건을 만족하는 pandoras 찾아오기 (이때 결과값 순서는 uuids 순서를 보장하지 않음)
  // pandoras의 개수 <= uuids 개수
  const pandoras = await Pandora.find({
    uuid: { $in: uuids },
    active: true,
    solver: null,
    solvedAt: null,
    solverAlias: null,
    isCatUncovered: false
  })
  .select('-_id uuid label writer title description problems totalProblems')
  .lean()
  .exec();

  // 찾아온 pandoras를 uuids 순서(최근 도전한 순서)대로 재정렬
  const pandorasSorted = uuids
    .map(uuid => pandoras.find(pandora => pandora.uuid === uuid ))
    .filter(pandora => pandora !== undefined); 

  return pandorasSorted;
}

/**
 * [내가 풀이를 완료한 판도라들을 반환한다]
 */
export async function findMyConqueredPandoras(solver, page) {
  const limit = PAGE_LIMIT_ITEMS.conquered;
  const skip = (page - 1) * limit;

  const total = await Pandora
    .countDocuments({ solver: solver, solvedAt: { $ne: null }, active: false });

  const pandoras = await Pandora.find({
    solver: solver,
    solvedAt: { $ne: null },
    active: false
  })
  .select('-_id uuid label writer title description problems totalProblems solvedAt')
  .sort({ solvedAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean()
  .exec();

  return { total, pandoras };
}
