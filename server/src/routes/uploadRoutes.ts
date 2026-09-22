import { Router } from 'express';
import { uploadReceipt } from '../controllers/uploadController.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();

router.post('/receipt', authMiddleware, uploadReceipt);

export default router;
