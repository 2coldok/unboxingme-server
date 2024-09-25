import { param } from "express-validator";
import { validateEndPoint } from "../validate.js";

export const validateUUIDV4 = [
  param('id')
    .isUUID(4) 
    .withMessage('id가 유효하지 않습니다.'),

  validateEndPoint
];
