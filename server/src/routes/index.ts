import { Router } from 'express';
import authRoutes from './authRoutes.ts';
import eventRoutes from './eventRoutes.ts';
import teamRoutes from './teamRoutes.ts';
import mahatmaRoutes from './mahatmaRoutes.ts';
import locationRoutes from './locationRoutes.ts';
import expenseRoutes from './expenseRoutes.ts';
import reportRoutes from './reportRoutes.ts';
import dashboardRoutes from './dashboardRoutes.ts';
import notificationRoutes from './notificationRoutes.ts';
import searchRoutes from './searchRoutes.ts';
import settingsRoutes from './settingsRoutes.ts';
import uploadRoutes from './uploadRoutes.ts';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/teams', teamRoutes);
router.use('/mahatmas', mahatmaRoutes);
router.use('/locations', locationRoutes);
router.use('/expenses', expenseRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/search', searchRoutes);
router.use('/settings', settingsRoutes);
router.use('/uploads', uploadRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Surat Center Management Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
