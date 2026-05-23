import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as userController from '../controllers/user.controller.js';
import verifyTokenMiddleware from '../middlewares/auth.middleware.js';
import * as userValidation from '../validations/user.validation.js';

const router = Router();

router.use(verifyTokenMiddleware);

router.get('/me', authController.me);
router.get('/', userController.getAll);
router.get('/:id', userValidation.mongoIdParam, userController.getById);
router.put('/:id', userValidation.update, userController.update);
router.delete('/:id', userValidation.mongoIdParam, userController.remove);

export default router;
