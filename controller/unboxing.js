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
    const initialRiddle = {
      currentQuestion: currentProblem.question,
      currentHint: currentProblem.hint,
      unsealedQuestionIndex: unsealedQuestionIndex,
      totalProblems: pandora.totalProblems,
      failCount: record.failCount
    };

    const data = mInitialRiddle(initialRiddle);
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
    const { problems, totalProblems } = req.pandora;
    const record = req.record;

    const riddleSupervisor = RiddleSupervisor.setup(problems, record);
    riddleSupervisor.gradeAnswer(submitAnswer);
    const updateResult = await riddleSupervisor.applyGradingResult(uuid, googleId);
    // 풀이결과 업데이트 실패
    if (!updateResult.success) {
      return failResponse(res, 404, null, updateResult.message);
    }

    const updatedRecord = riddleSupervisor.updatedRecord;
    const nextRiddle = {
      question: problems[updatedRecord.unsealedQuestionIndex].question,
      hint: problems[updatedRecord.unsealedQuestionIndex].hint,
      unsealedQuestionIndex: updatedRecord.unsealedQuestionIndex,
      totalProblems: totalProblems,
      failCount: updatedRecord.failCount,
      restrictedUntil: updatedRecord.restrictedUntil,
      unboxing: updatedRecord.unboxing
    }

    const data = mNextRiddle(nextRiddle);

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
