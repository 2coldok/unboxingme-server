import { v4 as uuidv4 } from 'uuid';
import Mongoose from 'mongoose';
import { setupPandoraSchema } from '../database/database.js';

/**
 * [default]
 * 삭제: maker, _id
 * 추가: createdAt, updatedAt
 */
const pandoraSchema = new Mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true },
  maker: { type: String, required: true },

  writer: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: { type: [String], required: true },
  
  problems: [
    {
      question: { type: String, required: true },
      hint: { type: String, required: true },
      answer: { type: String, required: true },
    }
  ],
  totalProblems: { type: Number, required: true },
  cat: { type: String, required: true },
 
  coverViewCount: { type: Number, required: true, default: 0 }, 

  solver: { type: String, default: null}, // string google id
  solverAlias: { type: String, default: null },
  solvedAt: { type: Date, default: null }, // 문제를 해결한 시간
  isCatUncovered: { type: Boolean, default: false }, // cat을 확인했는지 유무

  active: { type: Boolean, required: true, default: true },

  // !향후 열람 횟수 제한이 풀리면 사용
  openCount: { type: Number, required: true, default: 0 },
  maxOpen: { type: Number, required: true, enum: [1, -1], default: 1},
}, { timestamps: true, versionKey: false });

// [mongoose 미들웨어] solver가 이미 설정된 경우 수정이 불가능하도록 하는 pre-save 훅
pandoraSchema.pre('save', function (next) {
  if (this.isModified('solver') && this.solver !== null) {
    // 이미 설정된 googleId가 있으면 오류를 발생시켜 업데이트를 방지합니다.
    console.log('[Pandora DB 미들웨어 save] solver 가 이미 설정되어 있고 solver save 탐지');
    return next(new Error('solver는 한 번 설정된 후에는 수정할 수 없습니다.'));
  }
  console.log('[Pandora DB 미들웨어 save] solver 설정에 문제 없음');
  next();
});

pandoraSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  const query = this.getQuery();

  if (update.$set && update.$set['solver'] !== undefined) {
    // 현재 문서를 데이터베이스에서 가져옴
    const document = await this.model.findOne(query).exec();

    if (document.solver !== null) {
      console.log('[Pandora DB 미들웨어 findOneAndUpdate] solver가 이미 설정되어 있는데 solver를 수정 시도 탐지');
      // 만약 googleId가 이미 설정되어 있다면 업데이트를 막음
      return next(new Error('solver는 한 번 설정된 후에는 수정할 수 없습니다.'));
    }
  }
  console.log('[Pandora DB 미들웨어 findOneAndUpdate] solver 설정에 문제 없음');

  next();
});

// _id 제거 
// promblems 배열 _id 제거
// maker 제거
// createdAt, updatedAt, solvedAt 을 ISO string으로 변환 
setupPandoraSchema(pandoraSchema);
const Pandora = Mongoose.model('Pandora', pandoraSchema);

/**
 * [pandora screening]
 * 탐색 조건: active: true, uuid 일치
 * 필터: 없음
 * 삭제 및 추가 없음
 */
export async function findPandoraFScreening(uuid) {
  const pandora = await Pandora
    .findOne({ uuid: uuid, active: true })
    .lean()
    .exec(); // 없으면 null
  
  return pandora;
}

/**
 * [키워드 검색 결과]
 * 탐색 조건: active: true, keywords 에 일치하는 keyword 요소 포함
 * 선택: uuid, writer, title, description, coverViewCount, createdAt, updatedAt
 */
export async function findPandorasFSearchResult(keyword) {
  const pandoras = await Pandora
    .find({ active: true, keywords: { $in: [keyword] } })
    .select('uuid writer title description coverViewCount createdAt updatedAt')
    .lean()
    .exec(); // 못찾으면 빈배열
  
  return pandoras;
}

/**
 * [판도라 표지]
 * 탐색 조건: active: true, pandoraId 일치
 * 선택: writer, title, description, problems, totalProblems, coverViewCount, createdAt, updatedAt
 * 삭제: problems
 * 추가: firstQuestion, firstHint
 */
export async function findPandoraFCover(uuid) {
  const pandora = await Pandora
    .findOne({ uuid: uuid, active: true })
    .select('uuid writer title description problems totalProblems coverViewCount createdAt updatedAt')
    .lean()
    .exec(); // 못찾으면 null
  
  if (!pandora) {
    return null;
  }

  const { problems, ...pandoraObj } = pandora
  pandoraObj.firstQuestion = problems[0].question;
  pandoraObj.firstHint = problems[0].hint;

  return pandoraObj;
}

/**
 * [판도라 표지(조회수 업데이트)]
 */
export async function findPandoraFCoverWithIncreasedViewCount(uuid) {
  const updatedPandora = await Pandora
    .findOneAndUpdate(
      { uuid: uuid, active: true },
      { $inc: { coverViewCount: 1 } }, 
      { new: true, runValidators: true })
    .select('uuid writer title description problems totalProblems coverViewCount createdAt updatedAt')
    .lean()
    .exec();

  if (!updatedPandora) {
    return null; // pandora를 찾을 수 없음
  }

  const { problems, ...pandoraObj } = updatedPandora;

  pandoraObj.firstQuestion = problems[0].question;
  pandoraObj.firstHint = problems[0].hint;

  return pandoraObj;
}

/**
 * [새로운 판도라 만들기]
 * 삭제: sovler, solverAlias, solvedAt, isCatUncovered, openCount, maxOpen
 * 
 * save() 메서드에는 lena 또는 select 와 같은 메서드 사용 불가. 직접 구조분해 할당.
 */
export async function createPandora(pandoraData) {
  const savedPandora = await new Pandora(pandoraData).save();
  
  const { solver, solverAlias, solvedAt, isCatUncovered, openCount, maxOpen, ...result } = savedPandora.toObject();

  return result;
}


/**
 * [마이페이지 - 내가 만든 판도라] makerId(string 구글 아이디)
 * 삭제: maker, solver, openCount, maxOpen
 */
export async function findMyPandoras(makerId) {
  const pandoras = await Pandora
    .find({ maker: makerId })
    .select('-solver -openCount -maxOpen')
    .exec(); // 없으면 빈배열
  
  if (pandoras.length === 0) {
    return [];
  }
  
  return pandoras.map((pandora) => pandora.toObject());
}

/**
 * [최종적으로 cat 확인하기]
 * 선택: cat solver(유저의 구글id와 비교하기 위해서) solverAlias isCatUncovered
 */
export async function findPandoraFOnlyFirstSolver(pandoraUuid) {
  const pandora = await Pandora
    .findOne({ uuid: pandoraUuid })
    .select('cat solver solverAlias isCatUncovered')
    .exec();
  
  if (!pandora) {
    return null;
  }

  return pandora.toObject();
}

/**
 * [업데이트 통합]
 * updates : 판도라 스키마의 부분집합
 * 업데이트 된 판도라를 반환한다(new: true)
 */
export async function update(pandoraUuid, updates) {
  const updatedPandora = await Pandora.findOneAndUpdate(
    { uuid: pandoraUuid },
    { $set: updates },
    { new: true, runValidators: true }
  ).exec();

  return updatedPandora.toObject();
}









/**
 * openCount를 1증가시킨다.
 * 업데이트 된 판도라를 반환한다(new: true)
 * (열람횟수 제한이 없는 판도라를 위해서)
 */
export async function incrementOpenCount(pandoraId) {
  const updatedPandora = await Pandora.findByIdAndUpdate(
    pandoraId,
    { $inc: { openCount: 1 } },
    { new: true, runValidators: true }
  ).exec();

  return updatedPandora.toObject();
}

/**
 * openCount를 1증가시킨다.
 * active : false 로 판도라를 비활성화 한다.
 * 업데이트 된 판도라를 반환한다(new: true)
 * (열람횟수 제한이 1인 판도라를 위하여)
 */
export async function deactivateAndIncrementOpenCount(pandoraId) {
  const updatedPandora = await Pandora.findByIdAndUpdate(
    pandoraId,
    { $inc: { openCount: 1 }, active: false },
    { new: true, runValidators: true }
  ).exec();

  return updatedPandora.toObject();
}
