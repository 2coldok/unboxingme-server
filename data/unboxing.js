import Pandora from "../model/pandora.js";
import Record from "../model/record.js";

/**
 * [수수께끼를 해결하는동안 record를 업데이트한다. 풀이를 모두 완료하지 못한 record를 업데이트함을 보장한다]
 * 
 * 탐색실패: null
 */
export async function updateRecordBySubmitAnswer(challenger, pandora, updates) {
  const updatedRecord = await Record.findOneAndUpdate(
    { challenger: challenger, pandora: pandora, unboxing: false },
    { $set: updates },
    { new: true, runValidators: true })
    .select('-_id failCount restrictedUntil unsealedQuestionIndex unboxing')
    .lean()
    .exec();
  
  return updatedRecord;
}

/**
 * [유일하게 solver를 등록하는 데이터함수. solver가 최초이자 마지막으로 등록됨을 보장한다]
 * 
 * 업데이트 성공: true
 * 탐색실패: false
 */
export async function updateSolver(uuid, solver) {
  const updates = {
    solver: solver,
    solvedAt: new Date(),
    active: false
  };

  const updatedPandora = await Pandora.findOneAndUpdate(
    { uuid: uuid, active: true, solver: null, solvedAt: null, solverAlias: null, isCatUncovered: false },
    { $set: updates },
    { new: true, runValidators: true })
    .lean()
    .exec();

  if (!updatedPandora) {
    return false;
  }

  return true;
}

/**
 * [solverAlias가 등록되어 있는지 확인]
 * solverAlias가 등록되어 있지 않은 유저, solverAlais가 등록되어 있는 유저 모두에게 유효한 탐색이어야 한다.
 * 
 * 탐색실패: null
 */
export async function findSolverAliasBySolver(uuid, solver) {
  const pandora = await Pandora
    .findOne({ uuid: uuid, active: false, solver: solver, solvedAt: { $ne: null } })
    .select('-_id solverAlias solvedAt isCatUncovered cat')
    .lean()
    .exec();

  return pandora;  
}

/**
 * [처음이자 마지막인 solverAlias 등록을 보장한다.]
 * 
 * 탐색실패: null
 */
export async function updateSolverAlias(uuid, solver, solverAlias) {
  const updatedPandora = await Pandora.findOneAndUpdate(
    { uuid: uuid, active: false, solver: solver, solverAlias: null, isCatUncovered: false },
    { $set: { solverAlias: solverAlias } },
    { new: true, runValidators: true })
    .select('-_id solvedAt solverAlias isCatUncovered cat')
    .lean()
    .exec();
  
  return updatedPandora;
}

/**
 * [isCatUncovered 가 false라면 true로 만들고, cat을 반환한다.]
 * [isCatUncovered 가 true라면 cat을 반환한다.]
 * [TODO] 추후 cat열람 횟수를 기록하는 기능 추가하기.
 * 
 * 탐색실패: null
 */
export async function updateIsCatUncoveredAndGetCat(uuid, solver) {
  const updatedPandora = await Pandora.findOneAndUpdate(
    { uuid: uuid, active: false, solver: solver, solvedAt: { $ne: null }, solverAlias: { $ne: null } },
    { $set: { isCatUncovered: true } },
    { new: true, runValidators: true })
    .select('-_id cat')
    .lean()
    .exec();

  return updatedPandora;  
}
