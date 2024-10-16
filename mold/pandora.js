import { formatDateToString } from "../util/date.js";

export function mPandorasSearchResult(total, pandoras) {
  if (total === 0) {
    return {
      total: total,
      pandoras: []
    };
  }

  return {
    total: total,
    pandoras: pandoras.map(pandora => ({
      id: pandora.uuid,
      label: pandora.label,
      writer: pandora.writer,
      title: pandora.title,
      coverViewCount: pandora.coverViewCount,
      createdAt: formatDateToString(pandora.createdAt)
    }))
  };
}

export function mPandoraCover(pandora) {
  if (pandora === null) {
    return null;
  }

  const { problems, ...rest } = pandora;
  const firstQuestion = problems[0].question;
  const firstHint = problems[0].hint;

  return {
    id: rest.uuid,
    label: rest.label,
    writer: rest.writer,
    title: rest.title,
    description: rest.description,
    firstQuestion: firstQuestion,
    firstHint: firstHint,
    totalProblems: rest.totalProblems,
    coverViewCount: rest.coverViewCount,
    createdAt: formatDateToString(rest.createdAt),
    updatedAt: formatDateToString(rest.updatedAt)
  };
}

export function mMyPandoras(total, pandoras) {
  if (total === 0) {
    return {
      total: total,
      pandoras: []
    };
  }

  return {
    total: total,
    pandoras: pandoras.map((pandora) => ({
      id: pandora.uuid,
      label: pandora.label,
      writer: pandora.writer,
      title: pandora.title,
      coverViewCount: pandora.coverViewCount,
      solverAlias: pandora.solverAlias,
      solvedAt: formatDateToString(pandora.solvedAt),
      isCatUncovered: pandora.isCatUncovered,
      active: pandora.active,
      createdAt: formatDateToString(pandora.createdAt)
    }))
  };
}

export function mMyPandoraEdit(pandora) {
  return {
    writer: pandora.writer,
    title: pandora.title,
    description: pandora.description,
    keywords: pandora.keywords,
    problems: pandora.problems,
    cat: pandora.cat
  };
}

// totalDeletedRecords: number (0 이상의 정수)
export function mMyPandoraEditResult(totalDeletedRecords) {
  return {
    totalDeletedRecords: totalDeletedRecords
  };
}

// totalDeletedRecords: number (0 이상의 정수)
export function mMyPandoraDeleteResult(totalDeletedRecords) {
  return {
    totalDeletedRecords: totalDeletedRecords
  };
}
