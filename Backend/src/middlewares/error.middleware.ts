import { NextFunction, Request, Response } from 'express';

import ApiError from '../utils/api-error.js';

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(404, 'route not found'));
};

export const errorHandler = (
  error: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'internal server error';

  res.status(statusCode).json({
    error: message,
  });
};
