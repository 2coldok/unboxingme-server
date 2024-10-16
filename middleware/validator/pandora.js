import { body, query } from "express-validator";
import { validateEndPoint } from "../validate.js";

export const searchKeyword = [
  // keyword: 1 ~ 20
  query('keyword')
    .isLength({ max: 25 }) // 공백 실수 5글자까지 허용 그 이상시 바로 거절
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('키워드는 1글자 이상 20글자 이하로 작성해주세요'),
  
  query('page')
    .optional()
    .default(1)
    .isInt({ min: 1 })
    .withMessage('페이지 번호는 1 이상의 정수여야 합니다.'),  

  validateEndPoint
];

export const newPandora = [
  // writer: 기본값 '익명', 1 ~ 25
  body('writer')
    .isLength({ max: 30 }) // 공백 실수 5글자까지 허용 그 이상시 바로 거절
    .optional()
    .default('익명')
    .isString()
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage('작성자는 1글자 이상 25자 이하로 작성해주세요.'),
  
  // title: 1 ~ 60
  body('title')
    .isLength({ max: 65 }) // 공백 실수 5글자까지 허용 그 이상시 바로 거절
    .isString()
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage('제목은 1글자 이상 60자 이하로 작성해주세요.'),

  // description: 1 ~ 300
  body('description')
    .isLength({ max: 320 }) // 공백 실수 20글자까지 허용 그 이상시 바로 거절
    .isString()
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('설명은 1글자 이상 300자 이하로 작성해주세요.'),

  // keywords: 0 ~ 10, keywords가 존한다면 각각 1 ~ 20
  body('keywords')
    .isArray({ min: 0, max: 10 })
    .custom((keywords) => {
      if (keywords.length === 0) return true;

      return keywords.every(keyword => {
        return (
          typeof keyword === 'string' && 
          keyword.trim().length >= 1 && 
          keyword.trim().length <= 20
        );
      });
    })
    .withMessage('0 ~ 10개의 키워드에 각각 1 ~ 20글자로 작성해주세요.'),

  // problems: 1 ~ 10, question(3~100), hint(0 ~ 32), answer(1 ~ 32)
  body('problems')
    .isArray({ min: 1, max: 10 })
    .withMessage('문제는 최소 1개 이상 10이하로 만들어야 합니다.')
    .custom((problems) => {
      return problems.every(problem => {
        const { question, hint , answer } = problem;
        return (
          typeof question === 'string' &&
          typeof hint === 'string' &&
          typeof answer === 'string' && 
          question.trim().length >= 3 && 
          question.trim().length <= 100 &&
          hint.trim().length <= 32 &&
          answer.trim().length >= 1 && 
          answer.trim().length <= 32
        );
      });
    })
    .withMessage('question, hint, answer 조건에 맞게 입력하기.'),

  // cat: 1글자 ~ 1000글자
  body('cat')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('note는 1글자이상 1000자 이하로 작성해주세요.'),

  validateEndPoint
];
