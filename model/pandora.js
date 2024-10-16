import { v4 as uuidv4 } from 'uuid';
import Mongoose from 'mongoose';

/**
 * [default]
 * 삭제: maker, _id
 * 추가: createdAt, updatedAt
 */
const pandoraSchema = new Mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true },
  label: { type: String, required: true, unique: true },
  
  maker: { type: String, required: true },

  writer: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: { type: [String], required: true },
  
  problems: [
    {
      _id: false,
      question: { type: String, required: true },
      hint: { type: String, default: '' },
      answer: { type: String, required: true },
    }
  ],
  totalProblems: { type: Number, required: true },
  cat: { type: String, required: true },
 
  coverViewCount: { type: Number, required: true, default: 0 }, 

  // solver, solvedAt이 설정되어도 solverAlias를 설정하고 열람하지 않으면 solverAlias는 Null, isCatUncovered는 false 이다.ㄴ
  // solver,solvedAt => solverAlias, isCatUncovered
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

const Pandora = Mongoose.model('Pandora', pandoraSchema);

export default Pandora;
