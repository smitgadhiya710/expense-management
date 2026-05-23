import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';
import verifyTokenMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyTokenMiddleware);

router.get('/me', authController.me);

export default router;
