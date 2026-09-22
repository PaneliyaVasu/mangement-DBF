import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  cancelEvent,
  completeEvent,
  getEventSchedule,
  createEventSchedule,
  deleteEventSchedule,
  getEventTeams,
  addEventTeam,
  getEventAttendance,
  recordEventAttendance,
  getEventExpenses,
} from '../controllers/eventController.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';

const router = Router();

// Public / Authenticated event list and view
router.get('/', authMiddleware, getEvents);
router.get('/:id', authMiddleware, getEventById);

// Protected management routes
router.post(
  '/',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'EVENT_COORDINATOR']),
  createEvent
);

router.put(
  '/:id',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'EVENT_COORDINATOR']),
  updateEvent
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN']),
  deleteEvent
);

// State transitions
router.post(
  '/:id/publish',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'EVENT_COORDINATOR']),
  publishEvent
);

router.post(
  '/:id/cancel',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN']),
  cancelEvent
);

router.post(
  '/:id/complete',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'EVENT_COORDINATOR']),
  completeEvent
);

// Schedules
router.get('/:id/schedules', authMiddleware, getEventSchedule);
router.post(
  '/:id/schedules',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'EVENT_COORDINATOR']),
  createEventSchedule
);
router.delete(
  '/:id/schedules/:scheduleId',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'EVENT_COORDINATOR']),
  deleteEventSchedule
);

// Teams
router.get('/:id/teams', authMiddleware, getEventTeams);
router.post(
  '/:id/teams',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'EVENT_COORDINATOR']),
  addEventTeam
);

// Attendance
router.get('/:id/attendance', authMiddleware, getEventAttendance);
router.post(
  '/:id/attendance',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'EVENT_COORDINATOR', 'VOLUNTEER']),
  recordEventAttendance
);

// Expenses
router.get('/:id/expenses', authMiddleware, getEventExpenses);

export default router;
