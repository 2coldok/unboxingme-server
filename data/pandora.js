import Mongoose from 'mongoose';
import { setupSchemaVirtuals } from '../database/database.js';

const pandoraSchema = new Mongoose.Schema({
  publisher: { type: Mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  keyword: { type: [String], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },

  active: { type: Boolean, required: true },
  maxOpen: { type: Number, required: true },
  openCount: { type: Number, required: true },

  problems: [
    {
      question: { type: String, required: true },
      hint: { type: String, required: true },
      answer: { type: String, required: true },
    }
  ],
  
  cat: { type: String, required: true }
}, { timestamps: true });

setupSchemaVirtuals(pandoraSchema);
const Pandora = Mongoose.model('Pandora', pandoraSchema);

// * 활성화된 모든 판도라들을 반환한다.
export async function findActiveAll() {
  return Pandora.find({ active: true }).exec();
}

// * 키워드를 가지고 있는 활성화된 모든 판도라들을 반환한다.
export async function findAllActiveByKeyword(keyword) {
  return Pandora.find({ active: true, keyword: { $in: [keyword] } }).exec();
}

// * 판도라 아이디로 온전한 판도라를 반환한다. (활성화 되지 않은 판도라도)
export async function findById(pandoraId) {
  return Pandora.findById(pandoraId).exec();
}

// * 판도라 아이디로 활성화된 판도라의 problems를 반환한다. 
// * projection을 활용하여 problems 필드만 조회하여 db 부담을 줄임.
export async function findProblemsById(pandoraId) {
  const pandora = await Pandora.findOne({ _id: pandoraId, active: true }, 'problems');

  console.log(pandora); //
  return pandora.problems;
}

export async function create(pandoraData, id) {
  const newPandora = new Pandora({
    publisher: id,
    ...pandoraData,
    active: true,
  });

  const savedPandora = await newPandora.save();

  return savedPandora;
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
