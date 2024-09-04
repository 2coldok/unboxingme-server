import Stats from "../model/stats.js";

export async function updateTotalPandoras() {
  const updatedStats = await Stats.findOneAndUpdate(
    {},
    { $inc: { totalOpenedPandoras: 1 } },
    { new: true, upsert: true }
  );

  return updatedStats;
}
