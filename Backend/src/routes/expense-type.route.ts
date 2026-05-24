import { Router } from 'express';

import * as expenseTypeController from '../controllers/expense-type.controller.js';
import verifyTokenMiddleware from '../middlewares/auth.middleware.js';
import * as expenseTypeValidation from '../validations/expense-type.validation.js';

const router = Router();

router.use(verifyTokenMiddleware);

router.post('/', expenseTypeValidation.create, expenseTypeController.create);
router.get('/', expenseTypeValidation.list, expenseTypeController.getAll);
router.get('/:id', expenseTypeValidation.mongoIdParam, expenseTypeController.getById);
router.put('/:id', expenseTypeValidation.update, expenseTypeController.update);
router.delete('/:id', expenseTypeValidation.mongoIdParam, expenseTypeController.remove);

export default router;
