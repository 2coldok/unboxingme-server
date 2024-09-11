import Pandora from "../model/pandora.js";
import { transformData } from "../database/database.js";
import { COLLECTION_NAME } from "../constant/data.js";

/**
 * [default transform]
 * 삭제: _id, maker
 * 수정: solvedAt, createdAt, updatedAt
 */


/**
 * [unboxing에 사용되는 판도라]
 * 탐색 조건: uuid 일치, active: true, solver: null
 * 선택 : problems totalProblems maker
 */
export async function findPandoraFScreening(uuid) {
  const pandora = await Pandora
    .findOne({ uuid: uuid, active: true, solver: null })
    .select('problems totalProblems maker')
    .lean()
    .exec(); // 없으면 null
  
  if (!pandora) {
    return null;
  }

  const maker = pandora.maker; // maker 추출
  const filtedPandora = transformData(pandora, COLLECTION_NAME.pandora); // maker 삭제됨
  const result = { ...filtedPandora, maker: maker }; // maker 다시 추가
  
  return result;
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
  
  if (pandoras.length === 0) {
    return pandoras;
  }
  
  const filtedPandoras = transformData(pandoras, COLLECTION_NAME.pandora);
  
  return filtedPandoras;
}

/**
 * [판도라 표지]
 * 탐색 조건: active: true, uuid 일치
 * 선택: uuid, label, writer, title, description, problems, totalProblems, coverViewCount, createdAt, updatedAt
 * 삭제: problems
 * 추가: firstQuestion, firstHint
 */
export async function findPandoraFCover(uuid) {
  const pandora = await Pandora
    .findOne({ uuid: uuid, active: true })
    .select('uuid label writer title description problems totalProblems coverViewCount createdAt updatedAt')
    .lean()
    .exec(); // 못찾으면 null
  
  if (!pandora) {
    return null;
  }

  const filtedPandora = transformData(pandora, COLLECTION_NAME.pandora);

  const { problems, ...rest } = filtedPandora;
  rest.firstQuestion = problems[0].question;
  rest.firstHint = problems[0].hint;

  return rest;
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
    .select('uuid label writer title description problems totalProblems coverViewCount createdAt updatedAt')
    .lean()
    .exec();

  if (!updatedPandora) {
    return null; // pandora를 찾을 수 없음
  }

  const filtedPandora = transformData(updatedPandora, COLLECTION_NAME.pandora);

  const { problems, ...rest } = filtedPandora;
  rest.firstQuestion = problems[0].question;
  rest.firstHint = problems[0].hint;

  return rest;
}

/**
 * [새로운 판도라 만들기]
 * 삭제: sovler, solverAlias, solvedAt, isCatUncovered
 * 선택: uuid label writer title description keywords problems totalProblems cat coverViewCount active createdAt updatedAt
 * save() 메서드에는 lena 또는 select 와 같은 메서드 사용 불가. 직접 구조분해 할당해야됨
 */
export async function createPandora(pandoraData) {
  const savedPandora = await new Pandora(pandoraData).save();

  const { solver, solverAlias, solvedAt, isCatUncovered, ...rest } = savedPandora.toObject();

  const filtedPandora = transformData(rest, COLLECTION_NAME.pandora);

  return filtedPandora;
}


/**
 * [마이페이지 - 내가 만든 판도라] makerId(string 구글 아이디)
 * 삭제: solver
 * 선택: uuid label writer title description keywords problems totalProblems cat coverViewCount solverAlias solvedAt isCatUncovered active createdAt updatedAt
 */
export async function findMyPandoras(makerId) {
  const pandoras = await Pandora
    .find({ maker: makerId })
    .select('-solver')
    .lean()
    .exec(); // 없으면 빈배열

  if (pandoras.length === 0) {
    return pandoras;
  }  
  
  const filtedPandoras = transformData(pandoras, COLLECTION_NAME.pandora);
  
  return filtedPandoras;
}

/**
 * [마이페이지에서, 내가 만든 판도라 리스트를 불러올때 사용]
 * 삭제: solver
 * 선택: uuid label writer title description keywords problems totalProblems cat coverViewCount solverAlias solvedAt isCatUncovered active createdAt updatedAt
 */
export async function findMyPandora(uuid, makerId) {
  const pandora = await Pandora
    .findOne({ uuid: uuid, maker: makerId })
    .select('-solver')
    .lean()
    .exec();

  if (!pandora) {
    return null;
  }

  const filtedPandora = transformData(pandora, COLLECTION_NAME.pandora);

  return filtedPandora;
}

/**
 * [최종적으로 cat 확인하기]
 * 선택: cat solver(유저의 구글id와 비교하기 위해서) solverAlias isCatUncovered
 */
export async function findPandoraFOnlyFirstSolver(pandoraUuid) {
  const pandora = await Pandora
    .findOne({ uuid: pandoraUuid })
    .select('cat solver solverAlias isCatUncovered')
    .lean()
    .exec();
  
  if (!pandora) {
    return null;
  }

  const filtedPandora = transformData(pandora, COLLECTION_NAME.pandora);

  return filtedPandora;
}

// 조건: acive: true, solver: null
export async function updateActivePandora(pandoraUuid, updates) {
  const updatedPandora = await Pandora.findOneAndUpdate(
    { uuid: pandoraUuid, active: true, solver: null, solvedAt: null },
    { $set: updates },
    { new: true, runValidators: true })
    .lean()
    .exec();
  
  if (!updatedPandora) {
    return null;
  }

  const filtedPandora = transformData(updatedPandora, COLLECTION_NAME.pandora);

  return filtedPandora;
}

// 조건: active: false, isCatUncovered: false
export async function updateInactivePandora(pandoraUuid, updates) {
  const updatedPandora = await Pandora.findOneAndUpdate(
    { uuid: pandoraUuid, active: false, isCatUncovered: false },
    { $set: updates },
    { new: true, runValidators: true })
    .lean()
    .exec();
  
  if (!updatedPandora) {
    return null;
  }

  const filtedPandora = transformData(updatedPandora, COLLECTION_NAME.pandora);

  return filtedPandora;
}

/**
 * [업데이트 통합]
 * updates : 판도라 스키마의 부분집합
 * 업데이트 된 판도라를 반환한다(new: true)
 * 아직 반환값을 쓰는 경우는 없음
 */
export async function update(pandoraUuid, updates) {
  const updatedPandora = await Pandora.findOneAndUpdate(
    { uuid: pandoraUuid },
    { $set: updates },
    { new: true, runValidators: true })
    .lean()
    .exec();
  
  if (!updatedPandora) {
    return null;
  }

  const filtedPandora = transformData(updatedPandora, COLLECTION_NAME.pandora);

  return filtedPandora;
}

export async function deletePandora(pandoraUuid, googleId) {
  // 삭제할 판도라를 찾지 못했거나, 이미 삭제되었을 경우 null을 반환함.
  const deletedPandora = await Pandora.findOneAndDelete({ uuid: pandoraUuid, maker: googleId });
  if (!deletedPandora) {
    // 삭제 실패
    return false;
  }

  // 삭제 성공
  return true;
}
