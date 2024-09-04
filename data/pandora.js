import Pandora from "../model/pandora.js";

/**
 * [pandora screening]
 * 탐색 조건: active: true, uuid 일치
 * 필터: 없음
 * 삭제 및 추가 없음
 */
export async function findPandoraFScreening(uuid) {
  const pandora = await Pandora
    .findOne({ uuid: uuid, active: true })
    .lean()
    .exec(); // 없으면 null
  
  return pandora;
}

/**
 * [키워드 검색 결과]
 * 탐색 조건: active: true, keywords 에 일치하는 keyword 요소 포함
 * 선택: uuid, writer, title, description, coverViewCount, createdAt, updatedAt
 */
export async function findPandorasFSearchResult(keyword) {
  const pandoras = await Pandora
    .find({ active: true, keywords: { $in: [keyword] } })
    .select('uuid writer title description coverViewCount createdAt updatedAt')
    .lean()
    .exec(); // 못찾으면 빈배열
  
  return pandoras;
}

/**
 * [판도라 표지]
 * 탐색 조건: active: true, pandoraId 일치
 * 선택: writer, title, description, problems, totalProblems, coverViewCount, createdAt, updatedAt
 * 삭제: problems
 * 추가: firstQuestion, firstHint
 */
export async function findPandoraFCover(uuid) {
  const pandora = await Pandora
    .findOne({ uuid: uuid, active: true })
    .select('uuid writer title description problems totalProblems coverViewCount createdAt updatedAt')
    .lean()
    .exec(); // 못찾으면 null
  
  if (!pandora) {
    return null;
  }

  const { problems, ...pandoraObj } = pandora
  pandoraObj.firstQuestion = problems[0].question;
  pandoraObj.firstHint = problems[0].hint;

  return pandoraObj;
}

/**
 * [판도라 표지(조회수 업데이트)]
 */
export async function findPandoraFCoverWithIncreasedViewCount(uuid) {
  const updatedPandora = await Pandora
    .findOneAndUpdate(
      { uuid: uuid, active: true },
      { $inc: { coverViewCount: 1 } }, 
      { new: true, runValidators: true })
    .select('uuid writer title description problems totalProblems coverViewCount createdAt updatedAt')
    .lean()
    .exec();

  if (!updatedPandora) {
    return null; // pandora를 찾을 수 없음
  }

  const { problems, ...pandoraObj } = updatedPandora;

  pandoraObj.firstQuestion = problems[0].question;
  pandoraObj.firstHint = problems[0].hint;

  return pandoraObj;
}

/**
 * [새로운 판도라 만들기]
 * 삭제: sovler, solverAlias, solvedAt, isCatUncovered, openCount, maxOpen
 * 
 * save() 메서드에는 lena 또는 select 와 같은 메서드 사용 불가. 직접 구조분해 할당.
 */
export async function createPandora(pandoraData) {
  const savedPandora = await new Pandora(pandoraData).save();
  
  const { solver, solverAlias, solvedAt, isCatUncovered, openCount, maxOpen, ...result } = savedPandora.toObject();

  return result;
}


/**
 * [마이페이지 - 내가 만든 판도라] makerId(string 구글 아이디)
 * 삭제: maker, solver, openCount, maxOpen
 */
export async function findMyPandoras(makerId) {
  const pandoras = await Pandora
    .find({ maker: makerId })
    .select('-solver -openCount -maxOpen')
    .exec(); // 없으면 빈배열
  
  if (pandoras.length === 0) {
    return [];
  }
  
  return pandoras.map((pandora) => pandora.toObject());
}

/**
 * [최종적으로 cat 확인하기]
 * 선택: cat solver(유저의 구글id와 비교하기 위해서) solverAlias isCatUncovered
 */
export async function findPandoraFOnlyFirstSolver(pandoraUuid) {
  const pandora = await Pandora
    .findOne({ uuid: pandoraUuid })
    .select('cat solver solverAlias isCatUncovered')
    .exec();
  
  if (!pandora) {
    return null;
  }

  return pandora.toObject();
}

/**
 * [업데이트 통합]
 * updates : 판도라 스키마의 부분집합
 * 업데이트 된 판도라를 반환한다(new: true)
 */
export async function update(pandoraUuid, updates) {
  const updatedPandora = await Pandora.findOneAndUpdate(
    { uuid: pandoraUuid },
    { $set: updates },
    { new: true, runValidators: true }
  ).exec();

  return updatedPandora.toObject();
}









/**
 * openCount를 1증가시킨다.
 * 업데이트 된 판도라를 반환한다(new: true)
 * (열람횟수 제한이 없는 판도라를 위해서)
 */
export async function incrementOpenCount(pandoraId) {
  const updatedPandora = await Pandora.findByIdAndUpdate(
    pandoraId,
    { $inc: { openCount: 1 } },
    { new: true, runValidators: true }
  ).exec();

  return updatedPandora.toObject();
}

/**
 * openCount를 1증가시킨다.
 * active : false 로 판도라를 비활성화 한다.
 * 업데이트 된 판도라를 반환한다(new: true)
 * (열람횟수 제한이 1인 판도라를 위하여)
 */
export async function deactivateAndIncrementOpenCount(pandoraId) {
  const updatedPandora = await Pandora.findByIdAndUpdate(
    pandoraId,
    { $inc: { openCount: 1 }, active: false },
    { new: true, runValidators: true }
  ).exec();

  return updatedPandora.toObject();
}
