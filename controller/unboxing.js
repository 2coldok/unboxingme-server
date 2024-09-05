import { RiddleSupervisor } from '../domain/RiddleSupervisor.js';
import { InitialGateWay } from '../domain/InitialGateWay.js';
import { formatDateToString, isPenaltyPeriod } from '../util/date.js';
import { INITIAL_GATEWAY_STATUS } from '../constant/unboxing.js';

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
    return res.status(500).json({ message: '[SERVER] [controller-unboxing] [setupInitalGreenroom]' });
  }
}

// [Endpoint]
export async function getNextProblem(req, res) {
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
    const { question, hint, isCorrect } = riddleSupervisor.getCorrectnessWithNextQuestionAndHint(status, currentProblemIndex);
    
    return res.status(200).json({ 
      question: question, 
      hint: hint,
      isCorrect: isCorrect,
      unsealedQuestionIndex: updatedRecord.unsealedQuestionIndex,
      failCount: updatedRecord.failCount,
      restrictedUntil: formatDateToString(updatedRecord.restrictedUntil),
      isPenaltyPeriod: isPenaltyPeriod(updatedRecord.restrictedUntil),
      unboxing: updatedRecord.unboxing,
    });
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] 서버 자체 오류'});
  }
}
