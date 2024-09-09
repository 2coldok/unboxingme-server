import * as recordDB from '../data/record.js';

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
