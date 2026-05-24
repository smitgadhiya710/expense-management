import { body, param, query } from 'express-validator';

import validate from '../middlewares/validate.middleware.js';

const paymentModes = ['cash', 'bank', 'upi', 'card', 'other'];

export const mongoIdParam = [param('id').isMongoId(), validate];

export const create = [
  body('userId').optional().isMongoId(),
  body('expenseTypeId').isMongoId(),
  body('title').isString().trim().isLength({ min: 2, max: 150 }),
  body('amount').isFloat({ min: 0 }),
  body('paymentMode').optional().isIn(paymentModes),
  body('vendor').optional().isString().trim().isLength({ max: 100 }),
  body('notes').optional().isString().trim().isLength({ max: 500 }),
  body('billNumber').optional().isString().trim().isLength({ max: 100 }),
  validate,
];

export const list = [
  query('userId').optional().isMongoId(),
  query('expenseTypeId').optional().isMongoId(),
  query('paymentMode').optional().isIn(paymentModes),
  query('isDeleted').optional().isBoolean(),
  query('fromDate').optional().isISO8601(),
  query('toDate').optional().isISO8601(),
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
];

export const update = [
  param('id').isMongoId(),
  body('expenseTypeId').optional().isMongoId(),
  body('title').optional().isString().trim().isLength({ min: 2, max: 150 }),
  body('amount').optional().isFloat({ min: 0 }),
  body('expenseDate').optional().isISO8601(),
  body('paymentMode').optional().isIn(paymentModes),
  body('vendor').optional().isString().trim().isLength({ max: 100 }),
  body('notes').optional().isString().trim().isLength({ max: 500 }),
  body('billNumber').optional().isString().trim().isLength({ max: 100 }),
  validate,
];
