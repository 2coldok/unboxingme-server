import Mongoose from 'mongoose';
import { env } from '../config/env.js';
import { formatDateToString } from '../util/date.js';
import { COLLECTION_NAME } from '../constant/data.js';

export async function connectDB() {
  Mongoose.connect(env.db.host);
}

/**
 * objectedData: 객체 또는 객체배열(null 또는 빈배열 가능성 고려해서 안전장치)
 * collectionName: 'pandora' || 'record' || 'stats' 
 * return: transform 적용 된 객체 또는 객체배열
 */
export function transformData(objectedData, collectionName) {
  // 안전장치. null 또는 빈배열이면 transform 하지않고 그대로 반환한다
  if (!objectedData || (Array.isArray(objectedData) && objectedData.length === 0)) {
    return objectedData;
  }

  const transformFunction = getTransformFunction(collectionName);

  if (Array.isArray(objectedData)) {
    return objectedData.map((object) => transformFunction(object));
  }

  return transformFunction(objectedData);
}

function getTransformFunction(collectionName) {
  switch (collectionName) {
    case COLLECTION_NAME.pandora:
      return transformPandora;
    case COLLECTION_NAME.record:
      return transformRecord;
    case COLLECTION_NAME.stats:
      return transformStats;
    default:
      throw new Error('알 수 없는 collection name');
  }
}

// 삭제: _id, maker, openCount, maxOpen
// 수정: solvedAt, createdAt, updatedAt
function transformPandora(pandoraObj) {
  const { _id, maker, problems, openCount, maxOpen, solvedAt, createdAt, updatedAt, ...rest } = pandoraObj;

  const transformedProblems = problems?.map(problem => {
    const { _id, ...problemRest } = problem;

    return problemRest;
  });

  const result = {
    ...rest,
    ...(transformedProblems && { problems: transformedProblems }),
    ...(solvedAt && { solvedAt: formatDateToString(solvedAt) }),
    ...(createdAt && { createdAt: formatDateToString(createdAt) }),
    ...(updatedAt && { updatedAt: formatDateToString(updatedAt) }),
  };

  return result;
}

// 삭제: _id
// 수정: createdAt, updatedAt
// restrictedUntil 은 date 객체로 isPeneltyPeriod 를 계산하야 함을 date 객체로 그대로 둔다
function transformRecord(recordObj) {
  const { _id, createdAt, updatedAt, ...rest } = recordObj;

  const result = {
    ...rest,
    ...(createdAt && { createdAt: formatDateToString(createdAt) }),
    ...(updatedAt && { updatedAt: formatDateToString(updatedAt) }),
  };

  return result;
}

// 삭제: _id
// 수정: createdAt, updatedAt
function transformStats(statsObj) {
  const { _id, createdAt, updatedAt, ...rest } = statsObj;

  const result = {
    ...rest,
    ...(createdAt && { createdAt: formatDateToString(createdAt) }),
    ...(updatedAt && { updatedAt: formatDateToString(updatedAt) }),
  };

  return result;
}

