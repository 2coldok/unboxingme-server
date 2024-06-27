import Mongoose from 'mongoose';
import { setupPandoraSchemaVirtuals } from '../database/database.js';

const pandoraSchema = new Mongoose.Schema({
  maker: { type: String, required: true },
  writer: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: { type: [String], required: true },
  maxOpen: { type: Number, required: true }, // 제한이 없을경우 -1로 저장
  problems: [
    {
      question: { type: String, required: true },
      hint: { type: String, required: true },
      answer: { type: String, required: true },
    }
  ],
  cat: { type: String, required: true },

  active: { type: Boolean, required: true },
  openCount: { type: Number, required: true },
  viewCount: { type: Number, required: true },
  totalProblems: { type: Number, required: true }
}, { timestamps: true });

// _id 제거 id 사용
// promblem의 _id, id 제거
// maker 제거
// createdAt, updatedAt 을 ISO string으로 변환
setupPandoraSchemaVirtuals(pandoraSchema);
const Pandora = Mongoose.model('Pandora', pandoraSchema);

/**
 * 조건: active: true, keyword 일치
 * 선택: id, title, description, createdAt, updatedAt, viewCount
 */
export async function findActivePandorasByKeywordForSearcher(keyword) {
  const pandoras = await Pandora
    .find({ active: true, keywords: { $in: [keyword] } })
    .select('title description createdAt updatedAt viewCount')
    .exec();
    
  return pandoras.map(pandora => pandora.toObject());
}

/**
 * 조건: active: true, pandoraId 일치
 * 선택: id, title, description, totalProblems, maxOpen, openCount, createdAt, updatedAt, viewCount
 */
export async function findActivePandoraByIdForChallenger(pandoraId) {
  const pandora = await Pandora
    .findOne({ _id: pandoraId, active: true })
    .select('title description totalProblems maxOpen openCount createdAt updatedAt viewCount')
    .exec();

  return pandora.toObject();  
}

/**
 * 조건: pandoraData 가 Pandora 스키마와 일치한다.
 * 생성된 판도라를 온전히 반환한다.
 */
export async function create(pandoraData) {
  const savedPandora = await new Pandora(pandoraData).save();
  
  return savedPandora.toObject();
}


/**
 * 조건: makerId(구글 아이디)
 * 판도라 스키마를 온전히 반환한다
 * 찾지 못하면 빈 배열을 반환한다
 */
export async function findPandorasByMaker(makerId) {
  const pandoras = await Pandora.find({ maker: makerId }).exec();
  
  return pandoras.map((pandora) => pandora.toObject());
}


// * 판도라 아이디로 활성화된 판도라의 problems를 반환한다. 
// * projection을 활용하여 problems 필드만 조회하여 db 부담을 줄임.
export async function findProblemsById(pandoraId) {
  const pandora = await Pandora.findOne({ _id: pandoraId, active: true }, 'problems');

  console.log(pandora); //
  return pandora.problems;
}

export async function findQuestionWithHint(pandoraId, problemIndex) {
  const pandora = await Pandora.findById(pandoraId).exec();
  const problem = pandora.problems[problemIndex];

  return { question: problem.question, hint: problem.hint };
}

export async function findFirstQuestionWithHint(pandoraId) {
  const pandora = await Pandora.findById(pandoraId).exec();
  const firstProblem = pandora.problems[0];

  return { question: firstProblem.question, hint: firstProblem.hint };
}

export async function findCat(pandoraId) {
  const pandora = await Pandora.findById(pandoraId).exec();

  return pandora.cat;
}
