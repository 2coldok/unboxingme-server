import * as pandoraDB from '../data/pandora.js';
import * as recordDB from '../data/record.js';

const STATUS = {
  incorrect: 'INCORRECT',
  remain: 'REMAIN',
  end: 'END'
};

const RESTRICTED_TIME_MS = 1000 * 60 * 1;

// 업데이트할 status에 따라 업데이트 할 recordData 를 정의하고 반환함, 'END'의 경우 pandora 업데이트를 추가 진행한다.
class StatusHandler {
  constructor(record) {
    this.record = record;
  }

  async #handleEndStatus(pandoraUuid, googleId) {
    try {
      const updates = {
        solver: googleId,
        solvedAt: new Date(),
        active: false,
      }  
      await pandoraDB.update(pandoraUuid, updates); // 모든 수수께끼를 해결한 순간, 판도라 비활성화 + solver googleId 각인 + solvedAt 설정 (googleId는 최초 한번만 수정가능)
      return {
        unboxing: true,
        unsealedQuestionIndex: null,
      };
    } catch (error) {
      console.error('[SERVER] [#handleEndStatus]', error);
      throw new Error('모든 문제를 해결하였지만, 이보다 먼저 문제를 해결한 사람이 존재합니다.');
    }
  }

  getHandlers(pandoraUuid, googleId) {
    return {
      [STATUS.incorrect]: () => ({
        failCount: this.record.failCount + 1,
        restrictedUntil: new Date(new Date().getTime() + RESTRICTED_TIME_MS),
      }),
      [STATUS.remain]: () => ({
        unsealedQuestionIndex: this.record.unsealedQuestionIndex + 1,
      }),
      [STATUS.end]: () => this.#handleEndStatus(pandoraUuid, googleId)
    }
  }
}

class UnboxingManager extends StatusHandler{
  constructor(pandora, record) {
    super(record);
    this.pandora = pandora; 
  }

  static unboxing(pandora, record) {
    return new UnboxingManager(pandora, record);
  }

  // 현재 해결해야할 문제의 인덱스 검증
  validateProblemIndex(currentProblemIndex) {
    return currentProblemIndex === this.record.unsealedQuestionIndex;
  }

  // status 를 반환 INCORRECT: 오답, REMAIN: 정답 및 다음 문제 존재, END: 정답 및 모든 문제 해결
  getStatusByGradeAnswer(currentProblemIndex, submitAnswer) {
    const problem = this.pandora.problems[currentProblemIndex];

    if (problem.answer !== submitAnswer) {
      return STATUS.incorrect;
    }

    if (currentProblemIndex + 1 < this.pandora.problems.length) {
      return STATUS.remain;
    }

    if (currentProblemIndex + 1 === this.pandora.problems.length) {
      return STATUS.end;
    }

    throw new Error('[SERVER] [getStatusByGradeAnswer] status를 매길 수 없는 조건');
  }
  
  // status 에 해당하는 정답유무,질문,힌트를 반환
  getCorrectnessWithNextQuestionAndHint(status, currentProblemIndex) {
    const problems = this.pandora.problems;
    const currentProblem = problems[currentProblemIndex];
    const nextProblem = problems[currentProblemIndex + 1];

    const correctness = { isCorrect: status !== STATUS.incorrect };

    switch (status) {
      case STATUS.incorrect:
        return { 
          ...correctness,
          question: currentProblem.question,
          hint: currentProblem.hint
        }
      case STATUS.remain:
        return {
          ...correctness,
          question: nextProblem.question,
          hint: nextProblem.hint
        }
      case STATUS.end:
        return {
          ...correctness,
          question: null,
          hint: null
        }
      default: 
        throw new Error('Invalid status');
    }
  }

  // status에 따라 업데이트된 record를 반환
  async updateRecordByStatus(status, googleId, pandoraUuid) {
    const statusHandlers = this.getHandlers(pandoraUuid, googleId);
    const handler = statusHandlers[status];

    if (!handler) {
      throw new Error(`Invalid status: ${status}`);
    }

    const updateData = await handler();
    return recordDB.update(googleId, pandoraUuid, updateData);
  }
}

export default UnboxingManager;
