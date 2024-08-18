import Mongoose from 'mongoose';
import { setupPandoraSchemaVirtuals } from '../database/database.js';

const pandoraSchema = new Mongoose.Schema({
  maker: { type: String, required: true },
  writer: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: { type: [String], required: true },
  maxOpen: { type: Number, required: true, enum: [1, -1] }, // -1 : 열람횟수에 제한이 없음
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
    .select('writer title description maxOpen problems openCount viewCount totalProblems createdAt updatedAt')
    .exec();  

  return pandora.toObject();
}

/**
 * <pandoraData>
 * writer: string
 * title: string
 * description: string
 * keywords: [string]
 * maxOpen: number(제한이 없을경우 -1)
 * problems: [{question: string, hint: string, answer: string}]
 * cat: string
 * maker: string
 * active: true(boolean)
 * openCount: 0(number)
 * viewCount: 0(number) 
 * totalProblems: number
 * 
 * <savedPandora>
 * id: string
 * writer: string
 * title: string
 * description: string
 * keywords: [string]
 * maxOpen: number
 * problems: [{ question: string, hint: string, answer: string }]
 * cat: string
 * active: boolean
 * openCount: number
 * viewCount: number
 * totalProblems: number
 * createdAt: ISO String
 * updatedAt: ISO String
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

/**
 * 판도라 아이디로 활성화된 판도라의 problems를 반환한다. 
 */
export async function findProblemsById(pandoraId) {
  const pandora = await Pandora
    .findOne({ _id: pandoraId, active: true })
    .select('problems totalProblems')
    .exec();

  return pandora.toObject();
}

/**
 * 판도라 아이디로 cat을 반환한다.
 */
export async function findCat(pandoraId) {
  const pandora = await Pandora
    .findById(pandoraId)
    .select('cat')
    .exec();

  return pandora.toObject();
}

/**
 * 판도라 아이디로 업데이트 한다.
 * updates : 판도라 스키마의 부분집합
 * 업데이트 된 판도라를 반환한다(new: true)
 */
export async function update(pandoraId, updates) {
  const updatedPandora = await Pandora.findByIdAndUpdate(
    pandoraId,
    { $set: updates },
    { new: true, runValidators: true }
  ).exec();

  return updatedPandora.toObject();
}

/**
 * 판도라 아이디로 openCount를 1증가시킨다.
 * 업데이트 된 판도라를 반환한다(new: true)
 */
export async function updateOpenCount(pandoraId) {
  const updatedPandora = await Pandora.findByIdAndUpdate(
    pandoraId,
    { $inc: { openCount: 1 } },
    { new: true, runValidators: true }
  ).exec();

  return updatedPandora.toObject();
}
