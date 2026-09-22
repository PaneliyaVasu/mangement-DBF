import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();

router.get('/summary', authMiddleware, getDashboardSummary);

export default router;
