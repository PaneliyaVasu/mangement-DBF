import { Router } from 'express';
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/locationController.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';

const router = Router();

router.get('/', authMiddleware, getLocations);
router.get('/:id', authMiddleware, getLocationById);

router.post(
  '/',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN']),
  createLocation
);

router.put(
  '/:id',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN']),
  updateLocation
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN']),
  deleteLocation
);

export default router;
