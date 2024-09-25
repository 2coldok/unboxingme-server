import { validationResult } from "express-validator";
import { failResponse } from "../response/response.js";

export function validateEndPoint(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const errorMessage = errors.array()[0].msg;
  
  return failResponse(res, 400, null, errorMessage);
}
