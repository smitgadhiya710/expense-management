import { Router } from 'express';

import * as expenseController from '../controllers/expense.controller.js';
import verifyTokenMiddleware from '../middlewares/auth.middleware.js';
import * as expenseValidation from '../validations/expense.validation.js';

const router = Router();

router.use(verifyTokenMiddleware);

router.post('/', expenseValidation.create, expenseController.create);
router.get('/', expenseValidation.list, expenseController.getAll);
router.get('/:id', expenseValidation.mongoIdParam, expenseController.getById);
router.put('/:id', expenseValidation.update, expenseController.update);
router.delete('/:id', expenseValidation.mongoIdParam, expenseController.remove);
router.patch('/:id/restore', expenseValidation.mongoIdParam, expenseController.restore);

export default router;
