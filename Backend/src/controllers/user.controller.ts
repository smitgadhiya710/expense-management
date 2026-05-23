import { Request, Response } from 'express';
import { MongoServerError } from 'mongodb';

import User from '../models/user.model.js';
import ApiError from '../utils/api-error.js';
import asyncHandler from '../utils/async-handler.js';

export const getAll = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.status(200).json({ users: users.map((user) => user.toPublicJSON()) });
});

export const getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  res.status(200).json({ user: user.toPublicJSON() });
});

export const update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const allowedFields = ['userName', 'email', 'phone', 'role'];
  const updateData: Record<string, string> = {};

  allowedFields.forEach((field) => {
    const value = req.body[field];
    if (value !== undefined && value !== '') {
      updateData[field] = String(value).trim();
    }
  });

  if (updateData.email) {
    updateData.email = updateData.email.toLowerCase();
  }
  if (updateData.role) {
    updateData.role = updateData.role.toLowerCase();
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, 'no valid fields to update');
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new ApiError(404, 'user not found');
    }

    res.status(200).json({ user: user.toPublicJSON() });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new ApiError(409, 'user with email, phone, or userName already exists');
    }
    throw error;
  }
});

export const remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  res.status(204).send();
});
