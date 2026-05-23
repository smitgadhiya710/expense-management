import { body, param } from 'express-validator';

import validate from '../middlewares/validate.middleware.js';

export const mongoIdParam = [param('id').isMongoId(), validate];

export const update = [
  param('id').isMongoId(),
  body('userName').optional().isString().trim().isLength({ min: 3, max: 50 }),
  body('email').optional().isEmail().normalizeEmail().isLength({ max: 254 }),
  body('phone').optional().isString().trim().isLength({ min: 7, max: 20 }),
  body('role').optional().isIn(['user', 'admin']),
  validate,
];
