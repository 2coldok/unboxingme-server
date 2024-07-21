import * as pandoraDB from '../data/pandora.js';
import * as recordDB from '../data/record.js';
import { format, isBefore } from 'date-fns';

// 첫 진입시 현재 해결하고 있는 문제 및 record 정보 세팅
export async function setupInitialGreenroom(req, res) {
  const pandoraId = req.params.id;
  const record = req.record;
  const pandora = await pandoraDB.findProblemsById(pandoraId);
  if (!pandora) {
    return res.status(404).json({ message: '판도라를 찾을 수 없습니다.' });
  }
  const { problems, totalProblems } = pandora;
  
  // 1. 패널티 기간일 경우(판도라를 아직 열지는 못함)
  if (req.isPenaltyPeriod && !record.unboxing && record.unsealedQuestionIndex !== null) {
    console.log('setupInitialGreenroom : 패널티 기간'); // 
    const { question, hint } = problems[record.unsealedQuestionIndex];
    return res.status(200).json({
      totalProblems: totalProblems,
      currentQuestion: question,
      currentHint: hint,
      unsealedQuestionIndex: record.unsealedQuestionIndex,
      failCount: record.failCount,
      restrictedUntil: formatDateToString(record.restrictedUntil),
      isPenaltyPeriod: req.isPenaltyPeriod,
      unboxing: record.unboxing,
    });
  }

  // 2. unboxing을 완료한 판도라일 경우
  if (record.unboxing && record.unsealedQuestionIndex === null) {
    console.log('setupInitialGreenroom : unboxing 완료한 판도라'); //
    return res.status(200).json({
      totalProblems: totalProblems,
      currentQuestion: null,
      currentHint: null,
      unsealedQuestionIndex: record.unsealedQuestionIndex, // null
      failCount: record.failCount,
      restrictedUntil: formatDateToString(record.restrictedUntil),
      isPenaltyPeriod: req.isPenaltyPeriod,
      unboxing: record.unboxing, // true
    });
  }

  // 3. unboxing 하지 않았고, 패널티 기간이 아닐경우. 풀 문제가 남아있는 경우
  if (!req.isPenaltyPeriod && !record.unboxing && record.unsealedQuestionIndex !== null ) {
    console.log('setupInitialGreenroom : unboxing 하지 않았고, 패널티 기간이 아님'); //
    const { question, hint } = problems[record.unsealedQuestionIndex];
    return res.status(200).json({
      totalProblems: totalProblems,
      currentQuestion: question,
      currentHint: hint,
      unsealedQuestionIndex: record.unsealedQuestionIndex,
      failCount: record.failCount,
      restrictedUntil: formatDateToString(record.restrictedUntil),
      isPenaltyPeriod: req.isPenaltyPeriod,
      unboxing: record.unboxing,
    });
  }

  res.status(404).json({ message: 'setupInitalGreenroom : 원인을 알 수 없는 에러' });
}

// 정답확인 및 다음 문제 전달
export async function getNextProblem(req, res) {
  const pandoraId = req.params.id;
  const { currentProblemIndex, submitAnswer } = req.body;
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
  // unsealedQuestionIndex 를 0으로 초기화  + 패널티 우선 1분 -----> ***초기화 하지않기. 재접시 해결하지 못한 문제부터 시작하도록 변경*****
  if (submitAnswer !== answer) {
    const currentTime = new Date();
    const updatedRecord = await recordDB.update(
      googleId, 
      pandoraId,
      { 
        failCount: record.failCount + 1,
        restrictedUntil: new Date(currentTime.getTime() + 1000*60*1)
      }
    );
    
    return res.status(200).json({ 
      question: question,
      hint: hint,
      isCorrect: false,
      unsealedQuestionIndex: updatedRecord.unsealedQuestionIndex,
      failCount: updatedRecord.failCount,
      restrictedUntil: formatDateToString(updatedRecord.restrictedUntil),
      isPenaltyPeriod: isPenaltyPeriod(updatedRecord.restrictedUntil),
      unboxing: updatedRecord.unboxing,
    });
  }

  /**정답이면서 다음에 전달할 문제가 있을경우 */
  if (submitAnswer === answer && currentProblemIndex + 1 < problems.length) {
    const updatedRecord = await recordDB.update(
      googleId, 
      pandoraId, 
      { 
        unsealedQuestionIndex: record.unsealedQuestionIndex + 1 
      }
    );
    const nextProblem = problems[currentProblemIndex + 1];

    return res.status(200).json({ 
      question: nextProblem.question, 
      hint: nextProblem.hint,
      isCorrect: true,
      unsealedQuestionIndex: updatedRecord.unsealedQuestionIndex,
      failCount: updatedRecord.failCount,
      restrictedUntil: formatDateToString(updatedRecord.restrictedUntil),
      isPenaltyPeriod: isPenaltyPeriod(updatedRecord.restrictedUntil),
      unboxing: updatedRecord.unboxing,
    });
  }

  /**정답이면서 다음에 전달할 문제가 없을경우(모든 문제를 해결한 경우)  */
  if (submitAnswer === answer && currentProblemIndex + 1 === problems.length) {
    const updatedRecord = await recordDB.update(
      googleId, 
      pandoraId, 
      { 
        unboxing: true, 
        unsealedQuestionIndex: null 
      }
    );
    
    // 판도라의 openCount 업데이트
    const updatedPandora = await pandoraDB.updateOpenCount(pandoraId);
    
    return res.status(200).json({ 
      question: null, 
      hint: null,
      isCorrect: true,
      unsealedQuestionIndex: updatedRecord.unsealedQuestionIndex,
      failCount: updatedRecord.failCount,
      restrictedUntil: formatDateToString(updatedRecord.restrictedUntil),
      isPenaltyPeriod: isPenaltyPeriod(updatedRecord.restrictedUntil),
      unboxing: updatedRecord.unboxing,
    });
  }

  res.status(404).json({ message: "제출한 정답에 대해 고려하지 않은 경우 발생" });
}

function formatDateToString(date) {
  if (date === null) {
    return null;
  }

  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

// 패널티 시간 지났을 시 false반환
// 패널티 시간 안지났을 시 true 반환
function isPenaltyPeriod(restrictedUntilDate) {
  // 패널티 시간이 현재 시간보다 이전인 경우. (패널티 기간이 만료된 경우) 또는 패널티를 아예 받지 않은 상태일 경우(null)
  if (restrictedUntilDate === null || isBefore(restrictedUntilDate, new Date())) {
    return false
  }

  // 아직 현재시간이 패널티 시간보다 이전일 경우(패널티 기간에 속할 경우)
  return true;
}
