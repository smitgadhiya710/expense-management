import { NextFunction, Request, Response } from 'express';

import User from '../models/user.model.js';
import ApiError from '../utils/api-error.js';
import { verifyToken } from '../utils/jwt.js';

const verifyTokenMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
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
    const userId = payload.userId || payload.sub || '';
    const user = await User.findById(userId);

    if (!user) {
      return next(new ApiError(401, 'user not found'));
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return next();
  } catch (_error) {
    return next(new ApiError(401, 'invalid or expired token'));
  }
};

export default verifyTokenMiddleware;
