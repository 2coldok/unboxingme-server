import * as pandoraDB from '../data/pandora.js';
import * as recordDB from '../data/record.js';
import moment from 'moment';

// 정답확인 및 다음 문제 전달
export async function getNextProblem(req, res) {
  const pandoraId = req.params.id;
  const { currentProblemIndex, submitAnswer } = req.body;
  const record = req.record;
  
  // 올바른 문제 접근 확인
  if (currentProblemIndex !== record.unsealedQuestionIndex) {
    return res.status(404).json({ message: '올바르지 않은 index 접근입니다.' });
  }
  const problems = await pandoraDB.findProblemsById(pandoraId);
  if (!problems) {
    return res.status(404).json({ message: '문제를 찾을 수 없습니다.' });
  }
  const { question, hint, answer } = problems[currentProblemIndex];
  
  /**정답이 아닐경우 */
  if (submitAnswer !== answer) {
    const currentTime = new Date();
    const updatedRecord = await recordDB.update(req.userId, pandoraId, { failCount: record.failCount + 1, restrictedUntil: new Date(currentTime.getTime() + 1000*60*3)});
    
    return res.status(200).json({ 
      question: question,
      hint: hint,
      isCorrect: false,
      unsealedQuestionIndex: updatedRecord.unsealedQuestionIndex,
      failCount: updatedRecord.failCount,
      restrictedUntil: moment(updatedRecord.restrictedUntil).format('YYYY-MM-DD HH:mm:ss'),
      unboxing: updatedRecord.unboxing
    });
  }

  /**정답이면서 다음에 전달할 문제가 있을경우 */
  if (submitAnswer === answer && currentProblemIndex + 1 < problems.length) {
    const updatedRecord = await recordDB.update(req.userId, pandoraId, { unsealedQuestionIndex: record.unsealedQuestionIndex + 1 });
    const nextProblem = problems[currentProblemIndex + 1];

    return res.status(200).json({ 
      question: nextProblem.question, 
      hint: nextProblem.hint,
      isCorrect: true,
      unsealedQuestionIndex: updatedRecord.unsealedQuestionIndex,
      failCount: updatedRecord.failCount,
      restrictedUntil: moment(updatedRecord.restrictedUntil).format('YYYY-MM-DD HH:mm:ss'),
      unboxing: updatedRecord.unboxing
    });
  }

  /**정답이면서 모든 문제를 해결한 경우  */
  if (submitAnswer === answer && currentProblemIndex + 1 === problems.length) {
    const updatedRecord = await recordDB.update(req.userId, pandoraId, { unsealedQuestionIndex: record.unsealedQuestionIndex + 1, unboxing: true });

    return res.status(200).json({ 
      question: null, 
      hint: null,
      isCorrect: true,
      unsealedQuestionIndex: updatedRecord.unsealedQuestionIndex,
      failCount: updatedRecord.failCount,
      restrictedUntil: moment(updatedRecord.restrictedUntil).format('YYYY-MM-DD HH:mm:ss'),
      unboxing: updatedRecord.unboxing
    });
  }

  res.status(404).json({ message: "제출한 정답에 대해 고려하지 않은 경우 발생" });
}
