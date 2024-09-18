import { RiddleSupervisor } from '../domain/RiddleSupervisor.js';
import { InitialGateWay } from '../domain/InitialGateWay.js';
import { formatDateToString, isPenaltyPeriod } from '../util/date.js';
import { INITIAL_GATEWAY_STATUS } from '../constant/unboxing.js';

import * as pandoraDB from '../data/pandora.js';

// [ENDPOINT]
// 첫 진입시 현재 해결하고 있는 문제 및 record 정보 세팅
// record 데이터가 존재하면 Endpoint of GET
// record 데이터가 존재하지 않으면 Endpoint of POST
export async function getInitialGateWay(req, res) {
  try {
    const pandora = req.pandora;
    const record = req.record;
    const initialGateWay = new InitialGateWay(pandora, record);
    const status = initialGateWay.getStatus();

    if (status === INITIAL_GATEWAY_STATUS.unknown) {
      return res.status(404).json({ message: '확인할 수 없는 staus 입니다.' });
    }

    if (status === INITIAL_GATEWAY_STATUS.normal || status === INITIAL_GATEWAY_STATUS.peneltyPeriod) {
      const unsealedQuestionIndex = record.unsealedQuestionIndex;
      const problem = pandora.problems[unsealedQuestionIndex];
      
      return res.status(200).json({
        type: 'challenger',
        totalProblems: pandora.totalProblems,
        currentQuestion: problem.question,
        currentHint: problem.hint,
        unsealedQuestionIndex: unsealedQuestionIndex,
        failCount: record.failCount,
        restrictedUntil: formatDateToString(record.restrictedUntil),
        isPenaltyPeriod: isPenaltyPeriod(record.restrictedUntil),
      }); 
    }

    return res.status(404).json({ message: '[SERVER] [controller-unboxing] [setupInitialGreenroom] 사용자의 record가 예측 범위 밖' });
  } catch (error) {
    console.error('뭐가문제죠?', error);
    return res.status(500).json({ message: '[SERVER] [controller-unboxing] [setupInitalGreenroom]' });
  }
}

// [Endpoint]
export async function getNextGateWay(req, res) {
  try {
    const uuid = req.params.id;
    const { currentProblemIndex, submitAnswer } = req.body;
    const googleId = req.googleId;
    const pandora = req.pandora;
    const record = req.record;
    const riddleSupervisor = RiddleSupervisor.unboxing(pandora, record);

    if (!riddleSupervisor.validateProblemIndex(currentProblemIndex)) {
      res.status(400).json({ message: '올바르지 않은 index 접근입니다.' });
    }

    const status = riddleSupervisor.getStatusByGradeAnswer(currentProblemIndex, submitAnswer);
    const updatedRecord = await riddleSupervisor.updateRecordByStatus(status, googleId, uuid);
    const { isCorrect, totalProblems, question, hint,  } = riddleSupervisor.getCorrectnessWithNextQuestionAndHint(status, currentProblemIndex);
    
    return res.status(200).json({ 
      isCorrect: isCorrect,      
      failCount: updatedRecord.failCount,
      restrictedUntil: formatDateToString(updatedRecord.restrictedUntil),
      isPenaltyPeriod: isPenaltyPeriod(updatedRecord.restrictedUntil),
      unboxing: updatedRecord.unboxing,
      totalProblems: totalProblems,
      unsealedQuestionIndex: updatedRecord.unsealedQuestionIndex,
      question: question, 
      hint: hint
    });
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] 서버 자체 오류'});
  }
}


///////////////////////////////////

/**
 * 
 * solver alias 가 존재하는지 않하는지 오직 해당 판도라 solver에게 반환한다.
 */
export async function getSolverAliasStatus(req, res) {
  try {
    const pandora = req.pandora;
    console.log(pandora.solverAlias);
    
    // solverAlias가 존재 할경우
    if (pandora.solverAlias) {
      return res.status(200).json({ isSolverAlias: true });
    }

    // solverAlias가 존재하지 않을 경우
    return res.status(200).json({ isSolverAlias: false })
  } catch (error) {
    return res.status(500).json({ message: '[SERVER ERROR]' });
  }
}

/**
 * solverAlias를 최초로 등록하는 작업
 */
export async function registerSolverAlias(req, res) {
  try {
    const uuid = req.params.id;
    const { solverAlias } = req.body;
    const updates = {
      solverAlias: solverAlias
    };
    const updatedSolverAlias = await pandoraDB.updateSolverAlias(uuid, updates);
    if (!updatedSolverAlias) {
      return res.status(404).json({ message: '[SERVER] [updateSolverAlias] 업데이트할 판도라를 찾지 못했습니다.' });
    }
    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ message: '[SERVER ERROR]' });
  }
}

/**
 * [Response]
 * elpis: string
 * 
 * isCatUncovered를 true로 업데이트하고, elpis를 반환한다.
 */
export async function getElpis(req, res) {
  try {
    const { cat, isCatUncovered } = req.pandora;

    console.log(cat);

    if (isCatUncovered) {
      return res.status(200).json({ elpis: cat });
    }

    const uuid = req.params.id;
    const googleId = req.googleId;
    const updates = {
      isCatUncovered: true
    };
    // isCatUncovered를 true로 업데이한다.
    const updatedPandora = await pandoraDB.updatePandoraFElpisAccess(uuid, googleId, updates);
    if (!updatedPandora) {
      return res.status(404).json({ message: '[SERVER] 업데이트할 판도라를 찾지 못했습니다' });
    }

    return res.status(200).json({ elpis: cat });
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] [data-pandora] [findPandoraFOnlyFirstSolver]' });
  }
}