import { ANSWER_STATUS, PENELTY } from '../constant/unboxing.js';
import * as unboxingDB from '../data/unboxing.js';

export class RiddleSupervisor {
  #status = ''
  updatedRecord = {};

  constructor(problems, record, currentProblemIndex) {
    this.problems = problems; 
    this.record = record;
    this.currentProblemIndex = currentProblemIndex;
  }

  static setup(problems, record, currentProblemIndex) {
    return new RiddleSupervisor(problems, record, currentProblemIndex);
  }

  gradeAnswer(submitAnswer) {
    const problem = this.problems[this.currentProblemIndex];
    const nextProblemIndex = this.currentProblemIndex + 1;
    const totalProblems = this.problems.length;
    // 오답
    if (problem.answer !== submitAnswer) {
      this.#status = ANSWER_STATUS.incorrect;
      return false;
    }
    // 정답 + remain
    if (nextProblemIndex < totalProblems) {
      this.#status = ANSWER_STATUS.remain;
      return true;
    }
    // 정답 + end
    if (nextProblemIndex === totalProblems) {
      this.#status = ANSWER_STATUS.end;
      return true;
    }

    if (nextProblemIndex > totalProblems) {
      throw new Error('Invalid problem index from grading');
    }
    throw new Error('채점에 실패했습니다.');
  }

  async applyGradingResult(uuid, googleId) {
    if (this.#status === ANSWER_STATUS.end) {
      const result = await unboxingDB.updateSolver(uuid, googleId);
      if (!result) {
        return { success: false, message: '[pandora update fail] pandora에 solver 각인에 실패했습니다.' };
      }
    }

    const updates = this.#getRecordUpdates();
    const updatedRecord = await unboxingDB.updateRecordBySubmitAnswer(googleId, uuid, updates);
    if (!updatedRecord) {
      return { success: false, message: '[record update fail] record에 채점 결과를 반영하는데 실패했습니다.' };
    }
    console.log(updatedRecord);
    this.updatedRecord = updatedRecord;

    return { success: true, message: '채점 결과가 pandora 또는 record에 성공적으로 반영되었습니다.' };
  }

  #getRecordUpdates() {
    if (this.#status === ANSWER_STATUS.incorrect) {
      const restrictedUntil = this.#getRestrictedUntilDate();
      return {
        failCount: this.record.failCount + 1,
        restrictedUntil: restrictedUntil
      };
    }
    if (this.#status === ANSWER_STATUS.remain) {
      return {
        unsealedQuestionIndex: this.currentProblemIndex + 1
      };
    }
    if (this.#status === ANSWER_STATUS.end) {
      return {
        unsealedQuestionIndex: null,
        unboxing: true
      };
    }
  }

  #getRestrictedUntilDate() {
    const failCount = this.record.failCount;

    if (failCount === PENELTY.level1FailCount) {
      return new Date(new Date().getTime() + 1000 * 60 * 60);
    }
    if (failCount === PENELTY.level2FailCount) {
      return new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
    }
    if (failCount >= PENELTY.level3FailCount) {
      return new Date(new Date().setFullYear(new Date().getFullYear() + 100));
    }

    return this.record.restrictedUntil;
  }
}
