import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import 'express-async-errors';
import { connectDB } from './database/database.js';
import { env } from './config/env.js';
import passport from 'passport';

// router
import pandoraRouter from './router/pandora.js';
import userRouter from './router/user.js';
import searchRouter from './router/search.js';
import authRoutes from './router/auth.js';

// passport setup
import './config/googlePassport.js';

const app = express();

// 미들웨어
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173'],
}));
app.use(morgan('dev'));
app.use(passport.initialize()); // passport 초기화

// 라우터
app.use('/pandora', pandoraRouter);
app.use('/user', userRouter);
app.use('/search', searchRouter);
app.use('/auth', authRoutes);

// 로그인 임시 테스트 코드
app.get('/', (req, res) => {
  res.send('<h1>홈페이지</h1><a href="/auth/login">Google 로그인</a>');
});

// 정의되지 않은 api 처리
app.use((req, res, next) => {
  res.status(404).json({ message: '정의되지 않은 api 요청입니다.' });
})

// 서버 자체 오류 처리
app.use((error, req, res, next) => {
  console.log(`서버 자체 오류 : ${error}`);
  res.status(500).json({ message: '서버 오류' });
});

connectDB().then(() => {
  console.log('몽고 DB가 연결되었습니다.');
  app.listen(env.host.port);
});
