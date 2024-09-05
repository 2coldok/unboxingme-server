import * as pandoraDB from '../data/pandora.js';

export async function screeningActiveAndSolver(req, res, next) {
  try {
    const uuid = req.params.id;
    const pandora = await pandoraDB.findPandoraFScreening(uuid); // active: true, solver: null 판도라만 불러온다.

    if (!pandora) {
      return res.status(404).json({ message: '해당 id의 활성화된, solver가 없는, 판도라가 존재하지 않습니다.' });
    }

    // TODO 열람 제한 횟수 설정 기능 추가시 여기에서 구현하기

    req.pandora = pandora;
    return next();
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] [pandoraScreeniongOfActive]' });
  }
}
