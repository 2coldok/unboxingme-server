import { formatDateToString, isPenaltyPeriod } from "../util/date.js";

/**
 * failCount: number
 * restrictedUntil: string | null
 * 
 * reason: 'INACTIVE' | 'MINE' | 'SOLVED' | 'NOT_FOUND_RECORD'
 * 
 * riddle = {
 *   totalProblems: number
 *   currentQuestion: string
 *   currentHint: string
 *   unsealedQuestionIndex: number
 *   failCount: number
 * }
 * 
 */
export function mInitialRiddleFailByPenalty(failCount, restrictedUntil) {
  return {
    status: 'penalty',
    failCount: failCount,
    restrictedUntil: formatDateToString(restrictedUntil)
  };
}
export function mInitialRiddleFailByIneligible(reason) {
  return {
    status: 'ineligible',
    reason: reason
  };
}
export function mInitialRiddle(initialRiddle) {
  return {
    status: 'riddle',
    question: initialRiddle.currentQuestion,
    hint: initialRiddle.currentHint,
    unsealedQuestionIndex: initialRiddle.unsealedQuestionIndex,
    totalProblems: initialRiddle.totalProblems,
    failCount: initialRiddle.failCount
  };
}


/**
 * nextRiddle = {
 *   question: string,
 *   hint: string,
 *   unsealedQuestionIndex: number,
 *   totalProblems: number,
 *   failCount: number,
 *   restrictedUntil: date | null,
 *   unboxing: boolean
 * }
 */
export function mNextRiddle(nextRiddle) {
  const { unboxing, restrictedUntil } = nextRiddle;

  if (isPenaltyPeriod(restrictedUntil)) {
    return {
      status: 'penalty',
      failCount: nextRiddle.failCount,
      restrictedUntil: formatDateToString(restrictedUntil)
    };
  }

  if (unboxing) {
    return {
      status: 'end'
    };
  }
  
  return {
    status: 'riddle',
    question: nextRiddle.question,
    hint: nextRiddle.hint,
    unsealedQuestionIndex: nextRiddle.unsealedQuestionIndex,
    totalProblems: nextRiddle.totalProblems,
    failCount: nextRiddle.failCount
  };
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
