import { Request, Response } from 'express';
import { MongoServerError } from 'mongodb';

import ExpenseType from '../models/expense-type.model.js';
import ApiError from '../utils/api-error.js';
import asyncHandler from '../utils/async-handler.js';

const toKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toBoolean = (value: unknown): boolean => value === true || value === 'true';

export const create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const name = String(req.body.name).trim();
  const key = req.body.key ? toKey(String(req.body.key)) : toKey(name);
  const description = req.body.description ? String(req.body.description).trim() : undefined;

  if (!key) {
    throw new ApiError(400, 'expense type key is required');
  }

  try {
    const expenseType = await ExpenseType.create({
      name,
      key,
      description,
      isActive: req.body.isActive === undefined ? undefined : toBoolean(req.body.isActive),
    });

    res.status(201).json({ expenseType: expenseType.toPublicJSON() });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new ApiError(409, 'expense type with name or key already exists');
    }
    throw error;
  }
});

export const getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filter: Record<string, boolean> = {};

  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const expenseTypes = await ExpenseType.find(filter).sort({ name: 1 });
  res.status(200).json({ expenseTypes: expenseTypes.map((expenseType) => expenseType.toPublicJSON()) });
});

export const getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const expenseType = await ExpenseType.findById(req.params.id);
  if (!expenseType) {
    throw new ApiError(404, 'expense type not found');
  }

  res.status(200).json({ expenseType: expenseType.toPublicJSON() });
});

export const update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const updateData: Record<string, string | boolean | undefined> = {};

  if (req.body.name !== undefined && req.body.name !== '') {
    updateData.name = String(req.body.name).trim();
  }
  if (req.body.key !== undefined && req.body.key !== '') {
    updateData.key = toKey(String(req.body.key));
  }
  if (req.body.description !== undefined) {
    updateData.description = req.body.description === '' ? undefined : String(req.body.description).trim();
  }
  if (req.body.isActive !== undefined) {
    updateData.isActive = toBoolean(req.body.isActive);
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, 'no valid fields to update');
  }

  try {
    const expenseType = await ExpenseType.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!expenseType) {
      throw new ApiError(404, 'expense type not found');
    }

    res.status(200).json({ expenseType: expenseType.toPublicJSON() });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new ApiError(409, 'expense type with name or key already exists');
    }
    throw error;
  }
});

export const remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const expenseType = await ExpenseType.findByIdAndDelete(req.params.id);
  if (!expenseType) {
    throw new ApiError(404, 'expense type not found');
  }

  res.status(204).send();
});
