import { formatDateToString, isPenaltyPeriod } from "../util/date.js";

/**
 * riddle = {
 *   totalProblems: number
 *   currentQuestion: string
 *   currentHint: string
 *   unsealedQuestionIndex: number | null
 *   failCount: number,
 *   restrictedUntil: date | null
 * }
 * 
 * status = 'INACTIVE' | 'NOT_FOUND_RECORD' | 'MINE' | 'PENELTY_PERIOD' | 'SOLVED' | 'CHALLENGER'
 */
export function mInitialRiddle(initialRiddle, status) {
  if (!initialRiddle && status !== 'CHALLENGER') {
    return {
      type: 'fail',
      reason: status
    };
  }

  if (initialRiddle && status === 'CHALLENGER') {
    return {
      type: 'success',
      totalProblems: initialRiddle.totalProblems,
      currentQuestion: initialRiddle.currentQuestion,
      currentHint: initialRiddle.currentHint,
      unsealedQuestionIndex: initialRiddle.unsealedQuestionIndex,
      failCount: initialRiddle.failCount,
      restrictedUntil: formatDateToString(initialRiddle.restrictedUntil),
      isPenaltyPeriod: isPenaltyPeriod(initialRiddle.restrictedUntil)
    };
  }

  throw new Error('mInitialRiddle 매개변수 riidle, status 를 확인하세요');
}

/**
 * nextRiddle = {
 *   isCorrect: boolean,
 *   totalProblems: number,
 *   question: string | null,
 *   hint: string | null,
 *   unsealedQuestionIndex: number | null,
 *   failCount: number,
 *   restrictedUntil: date,
 *   unboxing: boolean
 * }
 */
export function mNextRiddle(nextRiddle) {
  return {
    isCorrect: nextRiddle.isCorrect,
    totalProblems: nextRiddle.totalProblems,
    question: nextRiddle.question,
    hint: nextRiddle.hint,
    unsealedQuestionIndex: nextRiddle.unsealedQuestionIndex,
    failCount: nextRiddle.failCount,
    restrictedUntil: formatDateToString(nextRiddle.restrictedUntil),
    isPenaltyPeriod: isPenaltyPeriod(nextRiddle.restrictedUntil), // 추가된것
    unboxing: nextRiddle.unboxing
  }
}

/**
 * isSolverAlias: boolean
 * 
 */
export function mSolverAliasStatus(isSolverAlias) {
  return {
    isSolverAlias: isSolverAlias
  };
}

/**
 * cat: string
 * 
 * [DB의 cat을 note 이름으로 반환한다.]
 */
export function mCat(cat) {
  return {
    note: cat
  };
}
