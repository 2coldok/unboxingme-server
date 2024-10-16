import { body } from "express-validator";
import { validateEndPoint } from "../validate.js";

// submitAnswer: 1 ~ 32
export const submitAnswer = [
  body('submitAnswer')
    .isLength({ max: 37 }) // 공백실수 5개까지 허용. 그 이상시 바로 거절
    .isString()
    .trim()
    .isLength({ min: 1, max: 32 })
    .withMessage('제출 정답은 1글자 이상 32글자 이하'),
  
  validateEndPoint
];

// solverAlias: 기본값: 익명, 1 ~ 30
export const solverAlias = [
  body('solverAlias')
    .isLength({ max: 45 }) // 공백실수 5개까지 허용. 그 이상시 바로 거절
    .optional()
    .default('익명')
    .isString()
    .trim()
    .isLength({ min: 1, max: 40 }),
  
  validateEndPoint  
];
