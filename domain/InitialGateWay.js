import { formatDateToString, isPenaltyPeriod } from "../util/date.js";

// 문제를 다 푼 순간 solver, active 업데이트가 됨으로
// 문제를 다 풀고 최종 메세지를 확인하지 않고 greenroom 페이지를 벗어났다면, 마에페이지에서만 확인할 수 있다.

export const INITIAL_STATUS = {
  peneltyPeriod: 'PENELTY_PERIOD',
  normal: 'NORMAL',
  inactive: 'INACTIVE', // solver 와 비활성화는 같이 설정 된다. 즉 active로 판단해도 충분
  unknown: 'UNKNOWN', // 예측을 벗어난 상태
};

export class InitialGateWay {
  constructor(pandora, record) {
    this.pandora = pandora;
    this.record = record;
  }

  getStatus() {
    // 모든 문제를 해결한 solver가 있거나 pandora가 비활성화 된 상태 (실제로 solver 와 active 는 같이 업데이트 된다)
    // 비활성화 상태이거나, solver가 기록되어 있다면 'INACTIVE' 상태를 반환한다.
    if (this.pandora.active === false || this.pandora.solver) {
      return INITIAL_STATUS.inactive;
    }

    // 패널티 기간인 경우
    if (isPenaltyPeriod(this.record.restrictedUntil)) {
      return INITIAL_STATUS.peneltyPeriod;
    }

    // 비활성화(문제풀림)x, 패널티기간x, 풀 문제 남아 있는 경우
    if (!this.record.unboxing && this.record.unsealedQuestionIndex !== null) {
      return INITIAL_STATUS.normal;
    }

    return INITIAL_STATUS.unknown;
  }
}