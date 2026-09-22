import { Router } from 'express';
import { getExpenseReports, getAttendanceReports } from '../controllers/reportController.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();

router.get('/expenses', authMiddleware, getExpenseReports);
router.get('/attendance', authMiddleware, getAttendanceReports);

export default router;
