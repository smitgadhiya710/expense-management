import { body } from 'express-validator';

import validate from '../middlewares/validate.middleware.js';

export const register = [
  body('userName').isString().trim().isLength({ min: 3, max: 50 }),
  body('email').isEmail().normalizeEmail().isLength({ max: 254 }),
  body('phone').isString().trim().isLength({ min: 7, max: 20 }),
  body('password').isString().isLength({ min: 8, max: 72 }),
  body('role').optional().isIn(['user', 'admin']),
  validate,
];

export const login = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
  validate,
];
