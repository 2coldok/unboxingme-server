import * as pandoraDB from '../data/pandora.js';
import * as recordDB from '../data/record.js';
import moment from 'moment';

// 정답확인 및 다음 문제 전달
export async function getNextProblem(req, res) {
  const { pandoraId, currentProblemIndex, submitAnswer } = req.body;
  const googleId = req.googleId;
  const record = req.record;
  
  // 올바른 문제 접근 확인(currentProblemIndex 가 올바른지 확인)
  // currentProblemIndex : 클라이언트 측에서 현재 해결하고 있는 문제의 인덱스
  // unsealedQuestionIndex : 유저가 아직 해결하지 못한 가장 최근 문제의 인덱스. 클라이언트의 문제 index 조작을 판별한다. 서버에서 순서대로 다음 문제를 제공할 수 있도록 보장한다
  if (currentProblemIndex !== record.unsealedQuestionIndex) {
    return res.status(404).json({ message: '올바르지 않은 index 접근입니다.' });
  }
  const { problems } = await pandoraDB.findProblemsById(pandoraId);
  if (!problems) {
    return res.status(404).json({ message: '문제를 찾을 수 없습니다.' });
  }
  const { question, hint, answer } = problems[currentProblemIndex];
  
  /**정답이 아닐경우 */
  // unsealedQuestionIndex 를 0으로 초기화  + 패널티 우선 1분
  if (submitAnswer !== answer) {
    const currentTime = new Date();
    const updatedRecord = await recordDB.update(
      googleId, 
      pandoraId,
      { failCount: record.failCount + 1, unsealedQuestionIndex: 0, restrictedUntil: new Date(currentTime.getTime() + 1000*60*1)}
    );
    
    return res.status(200).json({ 
      question: question,
      hint: hint,
      isCorrect: false,
      unsealedQuestionIndex: updatedRecord.unsealedQuestionIndex,
      failCount: updatedRecord.failCount,
      restrictedUntil: moment(updatedRecord.restrictedUntil).format('YYYY-MM-DD HH:mm:ss'),
      unboxing: updatedRecord.unboxing,
      cat: null
    });
  }

  /**정답이면서 다음에 전달할 문제가 있을경우 */
  if (submitAnswer === answer && currentProblemIndex + 1 < problems.length) {
    const updatedRecord = await recordDB.update(
      googleId, 
      pandoraId, 
      { unsealedQuestionIndex: record.unsealedQuestionIndex + 1 }
    );
    const nextProblem = problems[currentProblemIndex + 1];

    return res.status(200).json({ 
      question: nextProblem.question, 
      hint: nextProblem.hint,
      isCorrect: true,
      unsealedQuestionIndex: updatedRecord.unsealedQuestionIndex,
      failCount: updatedRecord.failCount,
      restrictedUntil: moment(updatedRecord.restrictedUntil).format('YYYY-MM-DD HH:mm:ss'),
      unboxing: updatedRecord.unboxing,
      cat: null
    });
  }

  /**정답이면서 다음에 전달할 문제가 없을경우(모든 문제를 해결한 경우)  */
  if (submitAnswer === answer && currentProblemIndex + 1 === problems.length) {
    const updatedRecord = await recordDB.update(
      googleId, 
      pandoraId, 
      { unboxing: true }
    );
    
    
    // 판도라의 openCount 업데이트
    const updatedPandora = await pandoraDB.updateOpenCount(pandoraId);
    const { cat } = updatedPandora;
    
    return res.status(200).json({ 
      question: null, 
      hint: null,
      isCorrect: true,
      unsealedQuestionIndex: updatedRecord.unsealedQuestionIndex,
      failCount: updatedRecord.failCount,
      restrictedUntil: moment(updatedRecord.restrictedUntil).format('YYYY-MM-DD HH:mm:ss'),
      unboxing: updatedRecord.unboxing,
      cat: cat
    });
  }

  res.status(404).json({ message: "제출한 정답에 대해 고려하지 않은 경우 발생" });
}
