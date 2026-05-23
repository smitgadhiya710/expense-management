import { NextFunction, Request, Response } from 'express';

import ApiError from '../utils/api-error.js';
import { verifyToken } from '../utils/jwt.js';

const auth = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header) {
    return next(new ApiError(401, 'authorization header is required'));
  }

  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return next(new ApiError(401, 'authorization header must use Bearer token'));
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.userId || payload.sub || '',
      email: payload.email,
    };
    return next();
  } catch (_error) {
    return next(new ApiError(401, 'invalid or expired token'));
  }
};

export default auth;
