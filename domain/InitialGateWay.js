import { INITIAL_GATEWAY_STATUS } from "../constant/unboxing.js";
import { isPenaltyPeriod } from "../util/date.js";

// 문제를 다 푼 순간 solver, active 업데이트가 됨으로
// 문제를 다 풀고 최종 메세지를 확인하지 않고 greenroom 페이지를 벗어났다면, 마에페이지에서만 확인할 수 있다.
export class InitialGateWay {
  constructor(pandora, record) {
    this.pandora = pandora;
    this.record = record;
  }

  getStatus() {
    // 패널티 기간인 경우
    if (isPenaltyPeriod(this.record.restrictedUntil)) {
      return INITIAL_GATEWAY_STATUS.peneltyPeriod;
    }

    // 비활성화(문제풀림)x, 패널티기간x, 풀 문제 남아 있는 경우
    if (!this.record.unboxing && this.record.unsealedQuestionIndex !== null) {
      return INITIAL_GATEWAY_STATUS.normal;
    }

    return INITIAL_GATEWAY_STATUS.unknown;
  }
}
