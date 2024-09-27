import { PAGE_LIMIT_ITEMS } from "../constant/page.js";
import Pandora from "../model/pandora.js";

/**
 * [키워드 검색 결과]
 * 조건1 active: true
 * 조건2 keywords에 keyword를 포함하고 있음
 * 
 * 검색실패: []
 */
export async function findPandorasBySearchKeyword(keyword, page) {
  const limit = PAGE_LIMIT_ITEMS.search;
  const skip = (page -1) * limit;

  const pandoras = await Pandora
    .find({ active: true, keywords: { $in: [keyword] } })
    .select('-_id uuid writer title description coverViewCount createdAt updatedAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  
  return pandoras;
}

/**
 * [판도라 표지]
 * 조건1 active: true
 * 조건2 uuid 일치
 * 
 * 검색실패: null
 */
export async function findPandoraFCover(uuid) {
  const pandora = await Pandora
    .findOne({ uuid: uuid, active: true })
    .select('-_id  uuid label writer title description problems totalProblems coverViewCount createdAt updatedAt')
    .lean()
    .exec(); 
    
  return pandora;
}

/**
 * [판도라 표지(조회수 업데이트 후 반환)]
 * 조건1 active: true
 * 조건2 uuid 일치
 * 
 * 검색실패: null
 */
export async function findPandoraFCoverWithIncreasedViewCount(uuid) {
  const updatedPandora = await Pandora
    .findOneAndUpdate(
      { uuid: uuid, active: true },
      { $inc: { coverViewCount: 1 } }, 
      { new: true, runValidators: true })
    .select('-_id uuid label writer title description problems totalProblems coverViewCount createdAt updatedAt')
    .lean()
    .exec();

  return updatedPandora;
}

/**
 * [내가 만든 판도라들(마이페이지)]
 * 조건1 maker 일치
 * 
 * 검색실패: 빈배열
 */
export async function findMyPandoras(maker, page) {
  const limit = PAGE_LIMIT_ITEMS.mine;
  const skip = (page - 1) * limit;

  const fieldsToSelect = [
    '-_id',
    'uuid',
    'label',
    'writer',
    'title',
    'description',
    'keywords',
    'problems',
    'totalProblems',
    'cat',
    'coverViewCount',
    'solverAlias',
    'solvedAt',
    'isCatUncovered',
    'active',
    'createdAt',
    'updatedAt',
  ].join(' ');

  const pandoras = await Pandora
    .find({ maker: maker })
    .select(fieldsToSelect)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  return pandoras;  
}

/**
 * [내가 만든 판도라 수정용]
 * 조건1 uuid 일치
 * 조건2 maker 일치
 * 
 * 검색실패: null
 */
export async function findMyPandoraFEdit(uuid, maker) {
  const pandora = await Pandora
    .findOne({ uuid: uuid, maker: maker })
    .select('-_id writer title description keywords problems cat')
    .lean()
    .exec();
  
  return pandora;
}

/**
 * [새로운 판도라 만들기]
 * 
 * 생성실패: error
 */
export async function createPandora(newPandoraData) {
  await new Pandora(newPandoraData).save();
}

/**
 * [내가 만든 판도라 삭제]
 * 
 * 삭제실패: false (삭제할 판도라를 찾지 못했거나(내 판도라가 아닐 수 있음), 이미 삭제되었을 경우 null을 반환함.)
 */
export async function deletePandora(uuid, maker) {
  const deletedPandora = await Pandora.findOneAndDelete({ uuid: uuid, maker: maker });
  if (!deletedPandora) {
    // 삭제 실패
    return false;
  }

  // 삭제 성공
  return true;
}

/**
 * [내가 만든 판도라 수정 전 안전을 위해 비활성화로 업데이트]
 * [활성화 되있고, solver가 존재하지 않는 판도라에 대해서 수정작업을 시작함을 보장한다]
 * 
 */
export async function makeInactiveMyPandora(uuid, maker) {
  const updatedPandora = await Pandora.findOneAndUpdate(
    { uuid: uuid, maker: maker, active: true, solver: null },
    { $set: { active: false } },
    { new: true, runValidators: true }
  );

  if (!updatedPandora) {
    return false;
  }

  return true;
}

/**
 * [내가 만든 판도라 수정]
 * solver: null 조건을 통해 solver가 아직 존재하지 않는 판도라만 수정할 수 있도록 함
 * 수정을 완료하면서 다시 active true로 변경
 * 
 * 수정실패: false
 */
export async function replaceMyPandora(uuid, maker, editPandoraData) {
  const { writer, title, description, keywords, problems, cat } = editPandoraData;

  const updatedPandora = await Pandora.findOneAndUpdate(
    { uuid: uuid, maker: maker, solver: null },
    { $set: {
      writer: writer,
      title: title,
      description: description,
      keywords: keywords,
      problems: problems,
      cat: cat,
      totalProblems: problems.length,
      active: true
    } },
    { new: true, runValidators: true }
  );
  // 수정할 나의 판도라를 찾지 못했을 경우
  if (!updatedPandora) {
    return false
  }
  
  // 수정에 성공하였을 경우
  return true;
}

/**
 * [도전할 수 있는 판도라 반환]
 * solver가 있을경우 사용자에게 알려주기위해 미들웨에서 필터링
 * 
 * 탐색실패: null
 */
export async function findChallengeablePandora(uuid) {
  const pandora = await Pandora
    .findOne({ uuid: uuid, active: true })
    .select('-_id problems totalProblems maker solver')
    .lean()
    .exec();

  return pandora;  
}
