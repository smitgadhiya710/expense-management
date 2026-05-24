import { Request, Response } from 'express';
import { Types } from 'mongoose';

import Expense from '../models/expense.model.js';
import ExpenseType from '../models/expense-type.model.js';
import ApiError from '../utils/api-error.js';
import asyncHandler from '../utils/async-handler.js';

const isAdmin = (req: Request): boolean => req.user?.role === 'admin';

const requireAuthUserId = (req: Request): string => {
  if (!req.user?.id) {
    throw new ApiError(401, 'authentication required');
  }

  return req.user.id;
};

const assertCanAccessExpense = (req: Request, expenseUserId: string): void => {
  if (!isAdmin(req) && expenseUserId !== requireAuthUserId(req)) {
    throw new ApiError(403, 'you do not have access to this expense');
  }
};

const getPagination = (req: Request): { page: number; limit: number; skip: number } => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const buildFilter = (req: Request): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  if (req.query.userId) {
    filter.userId = new Types.ObjectId(String(req.query.userId));
  }

  if (req.query.expenseTypeId) {
    filter.expenseTypeId = new Types.ObjectId(String(req.query.expenseTypeId));
  }

  if (req.query.paymentMode) {
    filter.paymentMode = req.query.paymentMode;
  }

  if (!isAdmin(req)) {
    filter.isDeleted = false;
  } else if (req.query.isDeleted !== undefined) {
    filter.isDeleted = req.query.isDeleted === 'true';
  }

  if (req.query.fromDate || req.query.toDate) {
    filter.expenseDate = {
      ...(req.query.fromDate ? { $gte: new Date(String(req.query.fromDate)) } : {}),
      ...(req.query.toDate ? { $lte: new Date(String(req.query.toDate)) } : {}),
    };
  }

  if (req.query.search) {
    const search = String(req.query.search).trim();
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { vendor: { $regex: search, $options: 'i' } },
      { billNumber: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
    ];
  }

  return filter;
};

export const create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = isAdmin(req) && req.body.userId ? String(req.body.userId) : requireAuthUserId(req);
  const expenseType = await ExpenseType.findOne({ _id: req.body.expenseTypeId, isActive: true });

  if (!expenseType) {
    throw new ApiError(404, 'active expense type not found');
  }

  const expense = await Expense.create({
    userId,
    expenseTypeId: req.body.expenseTypeId,
    title: String(req.body.title).trim(),
    amount: Number(req.body.amount),
    expenseDate: new Date(),
    paymentMode: req.body.paymentMode,
    vendor: req.body.vendor ? String(req.body.vendor).trim() : undefined,
    notes: req.body.notes ? String(req.body.notes).trim() : undefined,
    billNumber: req.body.billNumber ? String(req.body.billNumber).trim() : undefined,
  });

  await expense.populate(['userId', 'expenseTypeId']);

  res.status(201).json({ expense: expense.toPublicJSON() });
});

export const getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = getPagination(req);
  const filter = buildFilter(req);

  const [expenses, total, totalAmountResult] = await Promise.all([
    Expense.find(filter)
      .populate('userId')
      .populate('expenseTypeId')
      .sort({ expenseDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Expense.countDocuments(filter),
    Expense.aggregate<{ totalAmount: number }>([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  res.status(200).json({
    expenses: expenses.map((expense) => expense.toPublicJSON()),
    totalAmount: totalAmountResult[0]?.totalAmount || 0,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const expense = await Expense.findById(req.params.id).populate('userId').populate('expenseTypeId');
  if (!expense) {
    throw new ApiError(404, 'expense not found');
  }

  if (expense.isDeleted && !isAdmin(req)) {
    throw new ApiError(404, 'expense not found');
  }

  res.status(200).json({ expense: expense.toPublicJSON() });
});

export const update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const expense = await Expense.findById(req.params.id);
  if (!expense || expense.isDeleted) {
    throw new ApiError(404, 'expense not found');
  }

  assertCanAccessExpense(req, expense.userId.toString());

  if (req.body.expenseTypeId !== undefined) {
    const expenseType = await ExpenseType.findOne({ _id: req.body.expenseTypeId, isActive: true });
    if (!expenseType) {
      throw new ApiError(404, 'active expense type not found');
    }
    expense.expenseTypeId = req.body.expenseTypeId;
  }

  if (req.body.title !== undefined) expense.title = String(req.body.title).trim();
  if (req.body.amount !== undefined) expense.amount = Number(req.body.amount);
  if (req.body.expenseDate !== undefined) expense.expenseDate = new Date(req.body.expenseDate);
  if (req.body.paymentMode !== undefined) expense.paymentMode = req.body.paymentMode;
  if (req.body.vendor !== undefined) expense.vendor = req.body.vendor === '' ? undefined : String(req.body.vendor).trim();
  if (req.body.notes !== undefined) expense.notes = req.body.notes === '' ? undefined : String(req.body.notes).trim();
  if (req.body.billNumber !== undefined) {
    expense.billNumber = req.body.billNumber === '' ? undefined : String(req.body.billNumber).trim();
  }

  await expense.save();
  await expense.populate(['userId', 'expenseTypeId']);

  res.status(200).json({ expense: expense.toPublicJSON() });
});

export const remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const expense = await Expense.findById(req.params.id);
  if (!expense || expense.isDeleted) {
    throw new ApiError(404, 'expense not found');
  }

  assertCanAccessExpense(req, expense.userId.toString());

  expense.isDeleted = true;
  expense.deletedAt = new Date();
  await expense.save();

  res.status(204).send();
});

export const restore = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!isAdmin(req)) {
    throw new ApiError(403, 'admin access required');
  }

  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    throw new ApiError(404, 'expense not found');
  }

  expense.isDeleted = false;
  expense.deletedAt = undefined;
  await expense.save();
  await expense.populate(['userId', 'expenseTypeId']);

  res.status(200).json({ expense: expense.toPublicJSON() });
});
