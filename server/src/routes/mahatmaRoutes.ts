import { Router } from 'express';
import {
  getMahatmas,
  getMahatmaById,
  createMahatma,
  updateMahatma,
  deleteMahatma,
} from '../controllers/mahatmaController.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';

const router = Router();

router.get('/', authMiddleware, getMahatmas);
router.get('/:id', authMiddleware, getMahatmaById);

router.post(
  '/',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'EVENT_COORDINATOR', 'TEAM_COORDINATOR']),
  createMahatma
);

router.put(
  '/:id',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'EVENT_COORDINATOR', 'TEAM_COORDINATOR']),
  updateMahatma
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN']),
  deleteMahatma
);

export default router;
