import * as recordDB from '../data/record.js';
import * as pandoraDB from '../data/pandora.js';

export async function getMyPandoraLog(req, res) {
  try {
    const pandora = req.pandora;
    const pandoraUuid = pandora.uuid;
    const records = await recordDB.findRecords(pandoraUuid);

    return res.status(200).json({
      ...pandora,
      logs: records
    });

  } catch (error) {
    console.error('getMyPandoraLog', error);
    return res.status(500).json({ message: '[SERVER] [getMyPandoraLog] 서버 오류' });
  }
}

/**
 * [Response]
 * uuid: string
 * label: string
 * writer: string
 * title: string
 * description: string
 * firstQuestion: string
 * firstHint: string
 * totalProblems: number
 * coverViewCount: number
 * createdAt: ISO String
 * updatedAt: ISO String
 */
export async function getMyChallenges(req, res) {
  try {
    const googleId = req.googleId;
    const records = await recordDB.findMyRecords(googleId);
    if (records.length === 0) {
      return res.status(200).json(records);
    }

    const pandoraUuids = records.map((record) => record.pandora);

    const pandoras = await pandoraDB.findPandorasFChallenges(pandoraUuids);
    if (pandoras.length === 0) {
      return res.status(200).json(pandoras);
    }

    return res.status(200).json(pandoras);
  } catch (error) {
    console.error('[SERVER] getMyChallenges', error);
    return res.status(500).json({ message: '[SERVER] 서버 에러' });
  }
}