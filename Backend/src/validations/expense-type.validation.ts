import { body, param, query } from 'express-validator';

import validate from '../middlewares/validate.middleware.js';

const keyRule = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const mongoIdParam = [param('id').isMongoId(), validate];

export const create = [
  body('name').isString().trim().isLength({ min: 2, max: 100 }),
  body('key').optional().isString().trim().isLength({ min: 2, max: 100 }).matches(keyRule),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('isActive').optional().isBoolean(),
  validate,
];

export const list = [query('isActive').optional().isBoolean(), validate];

export const update = [
  param('id').isMongoId(),
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
  body('key').optional().isString().trim().isLength({ min: 2, max: 100 }).matches(keyRule),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('isActive').optional().isBoolean(),
  validate,
];
