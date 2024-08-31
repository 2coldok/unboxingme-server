import UnboxingManager from '../manager/UnboxingManager.js';
import InitialGateWay, { INITIAL_STATUS } from '../manager/InitialGateWay.js';
import { formatDateToString, isPenaltyPeriod } from '../util/date.js';

// 첫 진입시 현재 해결하고 있는 문제 및 record 정보 세팅
// record 있으면 GET [Endpoint] 없으면 POST 요청의 [Endpoint]
export async function getInitialGateWay(req, res) {
  try {
    const pandora = req.pandora;
    const record = req.record;
    const initialGateWay = new InitialGateWay(pandora, record);
    const status = initialGateWay.getStatus();
    
    if (status === INITIAL_STATUS.normal || status === INITIAL_STATUS.peneltyPeriod) {
      const response = initialGateWay.makeResponse();
      return res.status(200).json(response);
    }

    if (status === INITIAL_STATUS.inactive) {
      return res.status(404).json({ message: '비활성화 처리된 판도라입니다.' });
    }

    if (status === INITIAL_STATUS.unknown) {
      return res.status(404).json({ message: '확인할 수 없는 staus 입니다.' });
    }
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] [controller-unboxing] [setupInitalGreenroom]' });
  }
}

// [Endpoint]
export async function getNextProblem(req, res) {
  try {
    const pandoraId = req.params.id;
    const { currentProblemIndex, submitAnswer } = req.body;
    const googleId = req.googleId;
    const pandora = req.pandora;
    const record = req.record;
    const unboxing = UnboxingManager.unboxing(pandora, record);

    if (!unboxing.validateProblemIndex(currentProblemIndex)) {
      res.status(400).json({ message: '올바르지 않은 index 접근입니다.' });
    }

    const status = unboxing.getStatusByGradeAnswer(currentProblemIndex, submitAnswer);
    const updatedRecord = await unboxing.updateRecordByStatus(status, googleId, pandoraId);
    const { question, hint, isCorrect } = unboxing.getCorrectnessWithNextQuestionAndHint(status, currentProblemIndex);
    
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
