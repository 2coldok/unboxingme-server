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

  const records = await Record
    .find({ pandora: pandora })
    .select('-_id failCount restrictedUntil unsealedQuestionIndex unboxing createdAt updatedAt')
    .sort({ unsealedQuestionIndex: -1, updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  
  return records;
}

/**
 * [나의 구글 아이디로 내가 아직 도전중인 records를 찾는다]
 * 
 * skip(0): 데이터를 건너뛰지 않고 처음부터 가져오기
 * skip(1): 첫 번째 문서를 건너뛰고 두번째 문서부터 데이터 가져오기
 * 
 */
export async function findMyChallengeRecords(challenger, page) {
  const limit = PAGE_LIMIT_ITEMS.challenges;
  const skip = (page - 1) * limit;

  const records = await Record
    .find({ challenger: challenger, unboxing: false })
    .select('-_id pandora failCount restrictedUntil unsealedQuestionIndex createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  
  return records;
}

/**
 * [내가 도전중인 판도라]
 *  
 */
export async function findPandorasByMyChallenges(uuids) {
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

  return pandoras;
}

/**
 * [내가 풀이를 완료한 판도라들을 반환한다]
 */
export async function findMyConqueredPandoras(solver, page) {
  const limit = PAGE_LIMIT_ITEMS.conquered;
  const skip = (page - 1) * limit;

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

  return pandoras;
}
