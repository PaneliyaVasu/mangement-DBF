import { Router } from 'express';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
} from '../controllers/teamController.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';

const router = Router();

router.get('/', authMiddleware, getTeams);
router.get('/:id', authMiddleware, getTeamById);

router.post(
  '/',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'EVENT_COORDINATOR']),
  createTeam
);

router.put(
  '/:id',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'EVENT_COORDINATOR']),
  updateTeam
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN']),
  deleteTeam
);

router.post(
  '/:id/members',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'EVENT_COORDINATOR', 'TEAM_COORDINATOR']),
  addTeamMember
);

router.delete(
  '/:id/members/:mahatmaId',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'EVENT_COORDINATOR', 'TEAM_COORDINATOR']),
  removeTeamMember
);

export default router;
