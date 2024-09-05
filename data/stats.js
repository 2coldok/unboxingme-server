import Stats from "../model/stats.js";
import { transformData } from "../database/database.js";
import { COLLECTION_NAME } from "../constant/data.js";


// 함수 호출시 총 생성 판도라의 개수를 1 증가시키고 증가된 totalPandoras를 반환한다.
// 선택: 'totalPandoras'
export async function updateTotalPandoras() {
  const updatedStats = await Stats.findOneAndUpdate(
    {},
    { $inc: { totalPandoras : 1 } },
    { new: true, upsert: true, select: 'totalPandoras' })
    .lean()
    .exec();
  
  if (!updatedStats) {
    return null;
  }
  
  const filtedStats = transformData(updatedStats, COLLECTION_NAME.stats);

  return filtedStats;
}
