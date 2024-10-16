import { formatDateToString, isPenaltyPeriod } from "../util/date.js";

/**
 *
 * 
  pandora: {
    'label', string
    'writer', string
    'title', string
    'description', string
    'keywords', [string]
    'problems', {question:string, hint:string, answer:string}[]
    'totalProblems', number
    'cat', string
    'coverViewCount', number
    'solverAlias', string | null
    'solvedAt', date | null
    'isCatUncovered', boolean
    'active', boolean
    'createdAt', date
  }

  record: {
    unsealedQuestionIndex: number
    unboxing: boolean
    updatedAt: date
  } || null

  totalRecords: number

  **totalRecords가 0일경우 record는 반드시 null**

 */
export function mMyPandoraDetail(pandora, record, totalRecords) {
  if (totalRecords === 0) {
    return {
      pandora: pandora, // data처리 안함 나중에 하기
      totalRecords: 0,
      record: null
    };
  }
  
  return {
    pandora: {
      label: pandora.label,
      writer: pandora.writer,
      title: pandora.title,
      description: pandora.description,
      keywords: pandora.keywords,
      problems: pandora.problems,
      totalProblems: pandora.totalProblems,
      cat: pandora.cat,
      coverViewCount: pandora.coverViewCount,
      solverAlias: pandora.solverAlias,
      solvedAt: formatDateToString(pandora.solvedAt),
      isCatUncovered: pandora.isCatUncovered,
      active: pandora.active,
      createdAt: formatDateToString(pandora.createdAt)
    },
    totalRecords: totalRecords,
    record: {
      unsealedQuestionIndex: record.unsealedQuestionIndex,
      unboxing: record.unboxing,
      updatedAt: formatDateToString(record.updatedAt)
    }
  };
}

/**
 * records = [{
 *   pandora: string,
 *   failCount: number,
 *   restrictedUntil: date | null
 *   unsealedQuesitonIndex: number | null
 * }]
 * 
 * pandoras = [{
 *   uuid: string
 *   label: string
 *   writer: string
 *   title: string
 *   coverViewCount: number
 *   totalProblems: number
 *   createdAt: date
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
      totalProblems: pandora.totalProblems,
      coverViewCount: pandora.coverViewCount,
      createdAt: pandora.createdAt,
      failCount: record.failCount,
      restrictedUntil: formatDateToString(record.restrictedUntil),
      unsealedQuestionIndex: record.unsealedQuestionIndex,
      isPenaltyPeriod: isPenaltyPeriod(record.restrictedUntil),
    };
  });

  return myChallenges;
}

/**
 * pandora = {uuid label writer title coverViewCount solvedAt createdAt}[]
 */
export function mMyConqueredPandoras(total, pandoras) {
  if (total === 0) {
    return {
      total: 0,
      pandoras: []
    };
  }
  
  const mpandoras = pandoras.map(pandora => {
    return {
      id: pandora.uuid,
      label: pandora.label,
      writer: pandora.writer,
      title: pandora.title,
      coverViewCount: pandora.coverViewCount,
      solvedAt: formatDateToString(pandora.solvedAt),
      createdAt: formatDateToString(pandora.createdAt)
    }
  });
  
  return {
    total: total,
    pandoras: mpandoras
  };
}