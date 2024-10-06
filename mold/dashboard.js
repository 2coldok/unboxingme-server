import { formatDateToString, isPenaltyPeriod } from "../util/date.js";

/**
 * log = {
  label: string,
  totalProblems: number
  coverViewCount: number
  solverAlias: string | null
  solvedAt: date | null
  isCatUncovered: boolean

  total: number

  records: [{
    failCount: number 
    restrictedUntil: date | null
    unsealedQuestionIndex: number | null
    unboxing: boolean
    createdAt: date (record) 
    updatedAt: date (record)
  }]
}
 */
export function mMyPandoraLog(log) {
  const mRecords = log.records.map((record) => {
    return {
      failCount: record.failCount,
      restrictedUntil: formatDateToString(record.restrictedUntil),
      unsealedQuestionIndex: record.unsealedQuestionIndex,
      unboxing: record.unboxing,
      createdAt: formatDateToString(record.createdAt),
      updatedAt: formatDateToString(record.updatedAt)
    };
  });
  
  return {
    label: log.label,
    totalProblems: log.totalProblems,
    coverViewCount: log.coverViewCount,
    solverAlias: log.solverAlias,
    solvedAt: formatDateToString(log.solvedAt),
    isCatUncovered: log.isCatUncovered,
    total: log.total,
    records: mRecords
  };
}

/**
 * records = [{
 *   pandora: string,
 *   failCount: number,
 *   restrictedUntil: date | null
 *   unsealedQuesitonIndex: number | null
 *   createdAt: date,
 *   updatedAt: date,
 * }]
 * 
 * pandoras = [{
 *   uuid: string
 *   label: string
 *   writer: string
 *   title: string
 *   description: string
 *   problems: [{ quesiton: string, hint: string, answer: string }]
 *   totalProblems: number
 * }]
 * 
 */
export function mMyChallenges(records, pandoras) {
  // 컨트롤러에서 처리하지만, 안전장치
  if (pandoras.length === 0 || records.length === 0) {
    return [];
  }

  const myChallenges = pandoras.map((pandora) => {
    // record 데이터는 삭제할 수 없기 때문에 100% 상태를 보장한다.
    // 판도라는 비활성화 조건에 의해 records 와 일대일 대응이 되지 않는다.(판도라 데이터가 부족할 수 있음.)
    // 하지만 판도라는 내가 도전중인 판도라 id를 기반으로 불러왔기때문에, record.pandora === pandora.uuid가 반드시 존재함
    const record = records.find(record => record.pandora === pandora.uuid);

    return {
      id: pandora.uuid,
      label: pandora.label,
      writer: pandora.writer,
      title: pandora.title,
      description: pandora.description,
      currentQuestion: pandora.problems[record.unsealedQuestionIndex].question,
      currentHint: pandora.problems[record.unsealedQuestionIndex].hint,
      totalProblems: pandora.totalProblems,
      failCount: record.failCount,
      restrictedUntil: formatDateToString(record.restrictedUntil),
      unsealedQuestionIndex: record.unsealedQuestionIndex,
      isPenaltyPeriod: isPenaltyPeriod(record.restrictedUntil),
      createdAt: formatDateToString(record.createdAt),
      updatedAt: formatDateToString(record.updatedAt)
    };
  });

  return myChallenges;
}

export function mMyConqueredPandoras(total, pandoras) {
  if (total === 0) {
    return {
      total: 0,
      pandoras: []
    };
  }
  
  const myConqueredPandoras = pandoras.map(pandora => {
    return {
      id: pandora.uuid,
      label: pandora.label,
      writer: pandora.writer,
      title: pandora.title,
      description: pandora.description,
      firstQuestion: pandora.problems[0].question,
      firstHint: pandora.problems[0].hint,
      totalProblems: pandora.totalProblems,
      solvedAt: formatDateToString(pandora.solvedAt)
    }
  });
  
  return {
    total: total,
    pandoras: myConqueredPandoras
  };
}