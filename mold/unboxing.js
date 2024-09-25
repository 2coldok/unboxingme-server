import { formatDateToString, isPenaltyPeriod } from "../util/date.js";

/**
 * RType: 'penalty' | 'status' | 'riddle'
 * 
 * restrictedUntil: string | null
 * 
 * status: 'INACTIVE' | 'MINE' | 'SOLVED' | 'NOT_FOUND_RECORD'
 * 
 * riddle = {
 *   totalProblems: number
 *   currentQuestion: string
 *   currentHint: string
 *   unsealedQuestionIndex: number | null
 *   failCount: number,
 *   restrictedUntil: date | null
 * }
 * 
 */
export function mInitialRiddlePenalty(RType, restrictedUntil) {
  if (RType !== 'penalty') {
    throw new Error('RType이 penalty가 아닙니다.');
  }
  
  return {
    RType: 'penalty',
    restrictedUntil: formatDateToString(restrictedUntil)
  };
}
export function mInitialRiddleStatus(RType, status) {
  console.log('*******************');
  console.log(status)
  console.log('*******************');
  if (RType !== 'status') {
    throw new Error('RType이 status가 아닙니다.');
  }

  if (status && 'INACTIVE' && status !== 'MINE' && status !== 'SOLVED' && status !== 'NOT_FOUND_RECORD') {
    throw new Error('status 입력이 잘못되었습니다.');
  }

  return {
    RType: 'status',
    status: status
  };
}
export function mInitialRiddle(RType, initialRiddle) {
  if (RType !== 'riddle') {
    throw new Error('Rtype이 riddle이 아닙니다.');
  }
  return {
    RType: 'riddle',
    totalProblems: initialRiddle.totalProblems,
    currentQuestion: initialRiddle.currentQuestion,
    currentHint: initialRiddle.currentHint,
    unsealedQuestionIndex: initialRiddle.unsealedQuestionIndex,
    failCount: initialRiddle.failCount,
    restrictedUntil: formatDateToString(initialRiddle.restrictedUntil),
    isPenaltyPeriod: isPenaltyPeriod(initialRiddle.restrictedUntil)
  };
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
