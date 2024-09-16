import { formatDateToString } from "../util/date.js";

export function mPandorasSearchResult(pandoras) {
  if (pandoras.length === 0) {
    return [];
  }

  return pandoras.map(pandora => ({
    id: pandora.uuid,
    writer: pandora.writer,
    title: pandora.title,
    description: pandora.description,
    coverViewCount: pandora.coverViewCount,
    createdAt: formatDateToString(pandora.createdAt),
    updatedAt: formatDateToString(pandora.updatedAt)
  }));
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

export function mMyPandoras(pandoras) {
  if (pandoras.length === 0) {
    return [];
  }

  return pandoras.map((pandora) => ({
    id: pandora.uuid,
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
    createdAt: formatDateToString(pandora.createdAt),
    updatedAt: formatDateToString(pandora.updatedAt)
  }));
}

export function mMyPandoraEdit(pandora) {
  if (pandora === null) {
    return null
  }

  return {
    writer: pandora.writer,
    title: pandora.title,
    description: pandora.description,
    keywords: pandora.keywords,
    problems: pandora.problems,
    cat: pandora.cat
  };
}
