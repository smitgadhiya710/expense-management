import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as authValidation from '../validations/auth.validation.js';

const router = Router();

router.post('/register', authValidation.register, authController.register);
router.post('/signup', authValidation.register, authController.register);
router.post('/login', authValidation.login, authController.login);

export default router;
