import { Router } from 'express';
import { globalSearch } from '../controllers/searchController.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();

router.get('/', authMiddleware, globalSearch);

export default router;
