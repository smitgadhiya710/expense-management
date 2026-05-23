import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';

import User from '../models/user.model.js';
import ApiError from '../utils/api-error.js';
import asyncHandler from '../utils/async-handler.js';
import { generateToken } from '../utils/jwt.js';

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userName = String(req.body.userName).trim();
  const email = String(req.body.email).toLowerCase().trim();
  const phone = String(req.body.phone).trim();
  const role = String(req.body.role || 'user').toLowerCase().trim();

  const existingUser = await User.exists({
    $or: [{ email }, { phone }, { userName }],
  });

  if (existingUser) {
    throw new ApiError(409, 'user with email, phone, or userName already exists');
  }

  const password = await bcrypt.hash(String(req.body.password), 10);
  const user = await User.create({
    userName,
    email,
    phone,
    role,
    password,
  });

  const token = generateToken(user);
  res.status(201).json(user.toAuthJSON(token));
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const email = String(req.body.email).toLowerCase().trim();
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(String(req.body.password), user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'invalid email or password');
  }

  const token = generateToken(user);
  res.status(200).json(user.toAuthJSON(token));
});

export const me = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  res.status(200).json({ user: user.toPublicJSON() });
});
