import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

import ApiError from '../utils/api-error.js';

const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'invalid request body'));
  }

  return next();
};

export default validate;
