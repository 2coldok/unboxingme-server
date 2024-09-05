export const INITIAL_GATEWAY_STATUS = Object.freeze({
  peneltyPeriod: 'PENELTY_PERIOD',
  normal: 'NORMAL',
  unknown: 'UNKNOWN', // 예측을 벗어난 상태
});

export const ANSWER_STATUS = Object.freeze({
  incorrect: 'INCORRECT',
  remain: 'REMAIN',
  end: 'END',
});

export const PENELTY = Object.freeze({
  level1FailCount: 3,
  level2FailCount: 5,
  level3FailCount: 6,
  level1PeneltyTime: 1000 * 60 * 5, // 5분 패널티
  level2PeneltyTime: 1000 * 60 * 60, // 1시간 패널티
  level3PeneltyTime: 1000 * 60 * 60 * 24 // 24시간 패널티
});

