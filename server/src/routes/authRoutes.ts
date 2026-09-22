import { Router } from 'express';
import { register, login, getCurrentUser, refreshToken, logout } from '../controllers/authController.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/refresh', authMiddleware, refreshToken);

export default router;
