import { Router } from 'express';

import authRoutes from './auth.route.js';
import expenseTypeRoutes from './expense-type.route.js';
import profileRoutes from './profile.route.js';
import userRoutes from './user.route.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

const api = Router();

api.use('/auth', authRoutes);
api.use('/expense-types', expenseTypeRoutes);
api.use('/user', userRoutes);
api.use('/profile', profileRoutes);

router.use('/api/v1', api);

export default router;
