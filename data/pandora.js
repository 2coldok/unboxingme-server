import Pandora from "../model/pandora.js";
import { transformData } from "../database/database.js";
import { COLLECTION_NAME } from "../constant/data.js";
import { formatDateToString } from "../util/date.js";

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




// [마이페이지 나의 challenges 확인하기]
// active: true, solvedAt: null, isCatUncovered: false 를 만족하는 판도라들을 반환한다.
export async function findPandorasFMyChallenges(pandoraUuids) {
  const pandoras = await Pandora.find({
    uuid: { $in: pandoraUuids },
    active: true,
    solver: null,
    solvedAt: null,
    solverAlias: null,
    isCatUncovered: false
  })
  .select('uuid label writer title description problems totalProblems coverViewCount createdAt updatedAt')
  .lean()
  .exec();

  const filtedPandoras = transformData(pandoras, COLLECTION_NAME.pandora);

  return filtedPandoras.map((filtedPandora) => {
    const { problems, ...rest } = filtedPandora;
    rest.firstQuestion = problems[0].question;
    rest.firstHint = problems[0].hint;
    return rest;
  });
}

/**
 * [CheckIn api에서 pandoraScreening에 사용]
 * 조건: uuid일치, 비활성화되었으면서, solved된 판도라를 가져온다
 */
export async function findPandoraFCheckIn(uuid) {
  const pandora = await Pandora.findOne({
    uuid: uuid,
    active: false,
    solver: { $ne: null },
    solvedAt: { $ne: null }
  })
  .select('solver solverAlias -_id')
  .lean()
  .exec();

  console.log(pandora);

  if (!pandora) {
    return null;
  }

  return pandora;
}

/**
 * 판도라에 최초로 solver alias를 새기며, solverAlias가 새겨지면 이후 solver는 cat에 언제든 접근할 수 있다.
 * 조건: 비활성화 + solver존재 + 풀이완료시간존재 + solverAlias null + cat열람안된상태
 * 반환: true or false (업데이터 성공 여부만 반환환다)
 */
export async function updateSolverAlias(uuid, updates) {
  const updatedPandora = await Pandora.findOneAndUpdate({ 
    uuid: uuid,
    active: false, 
    solver: { $ne: null },
    solvedAt: { $ne: null },
    solverAlias: null, 
    isCatUncovered: false },
    { $set: updates },
    { new: true, runValidators: true })
    .lean()
    .exec();

  // 업데이트할 판도라를 찾지못했거나 업데이트할 필요가 없는경우
  if (!updatedPandora) {
    return false;
  } 
  
  return true;
}

/**
 * 해당 판도라의 solver에 해당하면서 solverAlias가 설정되어 있으면 elpis를 반환한다
 */
export async function findPandoraFElpisAccess(uuid, solver) {
  const pandora = await Pandora.findOne({
    uuid: uuid,
    active: false,
    solver: solver,
    solvedAt: { $ne: null },
    solverAlias: { $ne: null },
  })
  .select('cat isCatUncovered -_id')
  .lean()
  .exec();

  if (!pandora) {
    return null;
  }

  return pandora;
}


// solverAlias 가 각인된 내가 해결한 판도라를 찾아서, isCatUncovered: true로 업데이트 한다
// 반환: false or true
export async function updatePandoraFElpisAccess(uuid, solver, updates) {
  const updatedPandora = await Pandora.findOneAndUpdate({
    uuid: uuid,
    active: false,
    solver: solver,
    solverAlias: { $ne: null }},
    { $set: updates },
    { new: true, runValidators: true })
    .lean()
    .exec();  

  if (!updatedPandora) {
    return false;
  }
  
  return true
}

/**
 * [conquered]
 * uuid, solver가 일치하는 존재하는 판도라를 반환한다.
 */

export async function findMyConqueredPandoras(uuids, solver) {
  const pandoras = await Pandora.find({
    uuid: { $in: uuids },
    solver: solver
  })
  .select('uuid label writer title description problems totalProblems solvedAt coverViewCount -_id')
  .lean()
  .exec();

  if (!pandoras || pandoras.length === 0) {
    return [];
  }

  const transformedPandoras = pandoras.map((pandora) => {
    const { problems, solvedAt, ...rest } = pandora;
    rest.firstQuestion = problems[0].question;
    rest.firstHint = problems[0].hint;
    rest.solvedAt = formatDateToString(solvedAt);

    return rest;
  });

  return transformedPandoras;
}
