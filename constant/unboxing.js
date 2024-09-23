export const ANSWER_STATUS = Object.freeze({
  incorrect: 'INCORRECT',
  remain: 'REMAIN',
  end: 'END',
});

export const PENELTY = Object.freeze({
  level1FailCount: 2,
  level2FailCount: 4,
  level3FailCount: 6,
  level1PeneltyTime: new Date(new Date().getTime() + 1000 * 60 * 60),
  level2PeneltyTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
  level3PeneltyTime: new Date(new Date().setFullYear(new Date().getFullYear() + 100))
});
