import Stats from "../model/stats.js";

/**
 * [총 생성 판도라의 개수를 1 증가시키고 증가된 totalPandoras를 반환한다.]
 *
 * 업데이트실패: error
 */
export async function updateTotalPandoras() {
  const updatedStats = await Stats.findOneAndUpdate(
    {}, // 컬렉션에 있는 첫번째 문서를 선택한다.
    { $inc: { totalPandoras : 1 } },
    { new: true, upsert: true, select: 'totalPandoras' })
    .lean()
    .exec();
  
  return updatedStats;
}
