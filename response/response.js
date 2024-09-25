export function successResponse(res, statusCode=200, data, message) {
  if (Array.isArray(data) && data.length === 0) {
    message = message || '배열 데이터 반환값이 없습니다.';
  }

  if (data === null) {
    message = message || '단일 데이터 반환값이 없습니다.';
  }

  return res.status(statusCode).json({
    success: true,
    message: message || null,
    payload: data || null
  });
}

export function failResponse(res, statusCode=404, data, message='응답에 실패했습니다.') {
  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? '서버 에러' : message,
    payload: data || null
  });
}
