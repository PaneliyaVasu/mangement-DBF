import { Router } from 'express';
import {
  getCenterInfo,
  updateCenterInfo,
  getEventTypes,
  createEventType,
  getExpenseCategories,
  createExpenseCategory,
  getUsers,
  updateUserRole,
  getAuditLogs,
} from '../controllers/settingsController.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';

const router = Router();

router.get('/center', authMiddleware, getCenterInfo);
router.put(
  '/center',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN']),
  updateCenterInfo
);

router.get('/event-types', authMiddleware, getEventTypes);
router.post(
  '/event-types',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN']),
  createEventType
);

router.get('/expense-categories', authMiddleware, getExpenseCategories);
router.post(
  '/expense-categories',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'FINANCE_ADMIN']),
  createExpenseCategory
);

router.get(
  '/users',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN']),
  getUsers
);

router.put(
  '/users/:id/role',
  authMiddleware,
  requireRole(['SUPER_ADMIN']),
  updateUserRole
);

router.get(
  '/audit-logs',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN']),
  getAuditLogs
);

export default router;
