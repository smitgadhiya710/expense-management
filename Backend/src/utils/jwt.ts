import jwt, { Secret, SignOptions } from 'jsonwebtoken';

import config from '../config/index.js';
import { IUser } from '../models/user.model.js';

type JwtPayload = {
  userId: string;
  email: string;
};

export const generateToken = (user: IUser): string => {
  const options: SignOptions = {
    subject: user._id.toString(),
    expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    config.jwtSecret as Secret,
    options,
  );
};

export const verifyToken = (token: string): JwtPayload & jwt.JwtPayload =>
  jwt.verify(token, config.jwtSecret as Secret) as JwtPayload & jwt.JwtPayload;
