import * as pandoraDB from '../data/pandora.js';

// * 키워드를 통해 활성화된 판도라들을 반환한다.
export async function getSkinOfPandorasByKeyword(req, res) {
  const keyword = req.query.keyword;
  const pandoras = await pandoraDB.findAllActiveByKeyword(keyword);
  if (!pandoras || pandoras.length === 0) {
    return res.status(404).json({ message: '해당 키워드를 가진 활성화된 판도라가 존재하지 않습니다' });
  }
  
  const skinOfPandoras = pandoras.map((pandora) => {
    const {
      id,
      title,
      description,
      problems,
      maxOpen,
      openCount,
      createdAt,
      updatedAt
    } = pandora;

    return {
      id: id,
      title: title,
      description: description,
      problemsLength: problems.length,
      firstQuestion: problems[0].question,
      firstHint: problems[0].hint,  
      maxOpen: maxOpen,
      openCount: openCount,
      createdAt: createdAt,
      updatedAt: updatedAt
    }
  });

  res.status(200).json(skinOfPandoras);
}

// * 판도라의 상자를 생성한다
/** pandora data 약식
 * {
    "keyword": ["키워드1", "키워드2", "키워드3", "키워드4"],
    "title": "타이틀 자리",
    "description": "고양이가 궁금한 사람만",
    "maxOpen": 3,
    "openCount": 1,
    "problems": [
        {
            "question": "내가 좋아하는 가수이름?",
            "hint": "힌트자리",
            "answer": "백현"
        },
        {
            "question": "1+1=?",
            "hint": "수학",
            "answer": "2"
        }
    ],
    "cat": "최종메세지"
}
 */
export async function createPandora(req, res) {
  const pandoraData = req.body;
  const newPandora = await pandoraDB.create(pandoraData, req.userId);
  if (newPandora) {
    res.status(201).json(newPandora);
  } else {
    res.status(400).json({ message: '판도라 상자 만들기 실패!' });
  }
}

export async function getPandora(req, res) {
  const pandoraId = req.params.id;
  
  const pandora = await pandoraDB.findById(pandoraId);

  if (pandora) {
    res.status(200).json(pandora);
  } else {
    res.status(404).json({ message: '유효하지 않은 판도라상자 아이디 입니다.' });
  }
}
