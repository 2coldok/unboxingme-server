import Pandora from "../model/pandora.js";

/**
 * [키워드 검색 결과]
 * 조건1 active: true
 * 조건2 keywords에 keyword를 포함하고 있음
 * 
 * 검색실패: []
 */
export async function findPandorasFSearchResult(keyword) {
  const pandoras = await Pandora
    .find({ active: true, keywords: { $in: [keyword] } })
    .select('-_id uuid writer title description coverViewCount createdAt updatedAt')
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
export async function findMyPandoras(maker) {
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
 * [내가 만든 판도라 수정]
 * 
 * 수정실패: false
 */
export async function replaceMyPandora(uuid, maker, editPandoraData) {
  const pandora = await Pandora.findOne({ uuid: uuid, maker: maker });
  // 수정할 나의 판도라를 찾지 못했을 경우
  if (!pandora) {
    return false
  }

  const { writer, title, description, keywords, problems, cat } = editPandoraData;
  pandora.writer = writer;
  pandora.title = title;
  pandora.description = description;
  pandora.keywords = keywords;
  pandora.problems = problems;
  pandora.cat = cat;
  pandora.totalProblems = problems.length;
  await pandora.save();
  
  // 수정에 성공하였을 경우
  return true;
}

/**
 * [도전할 수 있는 판도라 반환]
 * 
 * 탐색실패: null
 */
export async function findChallengeablePandora(uuid) {
  const pandora = await Pandora
    .findOne({ uuid: uuid, active: true, solver: null })
    .select('-_id problems totalProblems maker')
    .lean()
    .exec();

  return pandora;  
}
