import * as unboxingDB from '../data/unboxing.js';
import { RiddleSupervisor } from '../domain/RiddleSupervisor.js';
import { mCat, mInitialRiddle, mNextRiddle, mSolverAliasStatus } from '../mold/unboxing.js';
import { successResponse, failResponse } from '../response/response.js';

export async function setInitialRiddle(req, res) {
  try {
    const pandora = req.pandora;
    const record = req.record;
    const unsealedQuestionIndex = record.unsealedQuestionIndex;
    const currentProblem = pandora.problems[unsealedQuestionIndex];
    const riddle = {
      totalProblems: pandora.totalProblems,
      currentQuestion: currentProblem.question,
      currentHint: currentProblem.hint,
      unsealedQuestionIndex: unsealedQuestionIndex,
      failCount: record.failCount,
      restrictedUntil: record.restrictedUntil,
    }
    const data = mInitialRiddle('riddle', riddle);
    return successResponse(res, 200, data);
  } catch (error) {
    console.error(error)
    return failResponse(res, 500);
  }
}

export async function getNextRiddle(req, res) {
  try {
    const uuid = req.params.id;
    const { submitAnswer } = req.body;
    const googleId = req.googleId;
    const { problems } = req.pandora;
    const record = req.record;

    const riddleSupervisor = RiddleSupervisor.setup(problems, record);
    const gradeResult = riddleSupervisor.gradeAnswer(submitAnswer);
    const updateResult = await riddleSupervisor.applyGradingResult(uuid, googleId);

    if (!updateResult.success) {
      return failResponse(res, 404, null, updateResult.message);
    }

    const updatedRecord = riddleSupervisor.updatedRecord;
    console.log('**************updatedRecord**************')
    console.log(updatedRecord);
    console.log('*****************************************')

    const unboxing = updatedRecord.unboxing;
    const nextRiddle = {
      isCorrect: gradeResult,
      totalProblems: problems.length,
      question: unboxing ? null : problems[updatedRecord.unsealedQuestionIndex].question,
      hint: unboxing ? null : problems[updatedRecord.unsealedQuestionIndex].hint,
      unsealedQuestionIndex: unboxing ? null : updatedRecord.unsealedQuestionIndex,
      failCount: updatedRecord.failCount,
      restrictedUntil: updatedRecord.restrictedUntil,
      unboxing: updatedRecord.unboxing
    }

    const data = mNextRiddle(nextRiddle);
    console.log('**************nextRiddle**************')
    console.log(data);
    console.log('*****************************************')

    return successResponse(res, 200, data, '채점이 성공정으로 완료되었습니다.');
  } catch (error) {
    console.error(error)
    return failResponse(res, 500);
  }
}

export async function getSolverAliasStatus(req, res) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    const pandora = await unboxingDB.findSolverAliasBySolver(uuid, googleId);
    if (!pandora) {
      return failResponse(res, 404, null, 'uuid 와 solver 조합이 일치하는 판도라를 찾을 수 없습니다.');
    }
    
    const isSolverAlias = pandora.solverAlias ? true : false;
    const data = mSolverAliasStatus(isSolverAlias);
    
    return successResponse(res, 200, data);
  } catch (error) {
    console.error(error)
    return failResponse(res, 500);
  }
}

export async function registerSolverAlias(req, res) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    const { solverAlias } = req.body;
    
    const updatedPandora = await unboxingDB.updateSolverAlias(uuid, googleId, solverAlias);
    if (!updatedPandora) {
      return failResponse(res, 404, null, 'solverAlias를 등록할 판도라를 찾지 못했습니다.');
    }
    
    return successResponse(res, 200, null, 'solverAlias를 성공적으로 등록하였습니다.');
  } catch (error) {
    console.error(error)
    return failResponse(res, 500);
  }
}

export async function getCat(req, res) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;

    const updatedPandora = await unboxingDB.updateIsCatUncoveredAndGetCat(uuid, googleId);
    if (!updatedPandora) {
      return failResponse(res, 404, null, 'cat을 열람할 판도라를 찾을 수 없습니다');
    }

    const data = mCat(updatedPandora.cat);
    return successResponse(res, 200, data);
  } catch (error) {
    console.error(error)
    return failResponse(res, 500);
  }
}
