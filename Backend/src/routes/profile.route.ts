import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = Router();

router.use(auth);

router.get('/me', authController.me);

export default router;
