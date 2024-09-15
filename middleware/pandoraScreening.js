import * as pandoraDB from '../data/pandora.js';

/**
 * [검증 리스트]
 * 0. uuid. 유효한 uuid인지?
 * 1. active. 판도라 활성화가 되어 있는지?
 * 2. solver. 풀이자가 존재 하지 않는지
 * 3. maker. 판도라 생성자가 아닌지
 */
export async function validatePandoraAccess(req, res, next) {
  try {
    const uuid = req.params.id;

    // active: true, solver: null 판도라만 불러온다.
    // maker problems totalProblems 만 가지고 있음
    const pandora = await pandoraDB.findPandoraFScreening(uuid); 

    if (!pandora) {
      return res.status(404).json({ message: '해당 id의 활성화된, solver가 없는, 판도라가 존재하지 않습니다.' });
    }

    // 판도라 생성자가 수수께끼를 도전하려고 할 경우
    const googleId = req.googleId;
    if (pandora.maker === googleId) {
      switch (req.method) {
        case 'GET':
          return res.status(206).json({
            type: 'mine',
          });
        case 'POST':
          return res.status(403).json({ message: '비 정상적인 접근입니다.' });
        case 'PATCH':
          return res.status(403).json({ message: '비 정상적인 접근입니다.' });
        default:
          return res.status(405).json({ message: '허용되지 않은 요청 방법입니다.' });
      }
    }

    // TODO 열람 제한 횟수 설정 기능 추가시 여기에서 구현하기

    // 안전을 위해 maker 제거하고 전달
    const { maker, ...pandoraRest } = pandora;

    req.pandora = pandoraRest;
    return next();
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] [pandoraScreeniongOfActive]' });
  }
}

/**
 * [검증 리스트]
 * 0. 해당 uuid의 판도라가 존재하는지 확인
 * 1. 해당 uuid의 판도라가 내가 만든 판도라가 맞는지 검증
 */
export async function verifyPandoraMaker(req, res, next) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    
    const pandora = await pandoraDB.findMyPandora(uuid, googleId);
    if (!pandora) {
      return res.status(404).json({ message: '[SERVER] [verifyPandoraMaker] 판도라가 존재하지 않거나 내가 만든 판도라가 아님.' });
    }
    req.pandora = pandora;
    return next();
  } catch (error) {
    console.error('verifyPandoraMaker', error);
    return res.status(500).json({ message: '[SERVER] [verifyPandoraMaker] 서버 오류' });
  }
}

/**
 * 해당 판도라(비활성화 + solved 완료된 판도라)를 불러와서, solver인지 pandora차원에서 재확인한다.
 */
export async function screeningPandoraSolver(req, res, next) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    const pandora = await pandoraDB.findPandoraFCheckIn(uuid);
    if (!pandora) {
      return res.status(404).json({ message: '[SERVER] 판도라를 찾을 수 없습니다.' });
    }
    
    const { solver } = pandora;
    if (googleId !== solver) {
      return res.status(403).json({ message: '[SERVER] 해당 판도라의 solver가 아닙니다.' });
    }

    req.pandora = pandora;
    console.log('middleware2 screeningPandoraSolver 통과');
    return next();
  } catch (error) {
    return res.status(500).json({ message: '[SERVER] [verifyPandoraSolver]' })
  }
}

/**
 * 해당판도라의 solver일치 + solverAlias 설정완료 된 비활성화 판도라를 반환한다.
 */
export async function elpisAccessAuthorization(req, res, next) {
  try {
    const uuid = req.params.id;
    const googleId = req.googleId;
    // cat, isCatUncovered
    const pandora = await pandoraDB.findPandoraFElpisAccess(uuid, googleId);
    if (!pandora) {
      return res.status(404).json({ message: '[SERVER] [elpisAccessAuthorization] 판도라를 찾을 수 없습니다.' });
    }

    req.pandora = pandora;
    return next();
  } catch (error) {
    return res.status(500).json({ message: '[SERVER]]' })
  }
}
