import { format, isBefore } from 'date-fns';

export function formatDateToString(date) {
  if (date === null) {
    return null;
  }

  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

// 패널티 시간 지났을 시 false반환
// 패널티 시간 안지났을 시 true 반환
export function isPenaltyPeriod(restrictedUntilDate) {
  // 패널티 시간이 현재 시간보다 이전인 경우. (패널티 기간이 만료된 경우) 또는 패널티를 아예 받지 않은 상태일 경우(null)
  if (restrictedUntilDate === null || isBefore(restrictedUntilDate, new Date())) {
    return false
  }

  // 아직 현재시간이 패널티 시간보다 이전일 경우(패널티 기간에 속할 경우)
  return true;
}