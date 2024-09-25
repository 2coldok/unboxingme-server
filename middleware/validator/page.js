import { query } from "express-validator";
import { validateEndPoint } from "../validate.js";

export const validatePage = [
  query('page')
    .optional()
    .default(1)
    .isInt({ min: 1 })
    .withMessage('페이지 번호는 1 이상의 정수여야 합니다.'),
  
  validateEndPoint
];
