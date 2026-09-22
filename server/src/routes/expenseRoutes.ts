import { Router } from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  submitExpense,
  approveExpense,
  rejectExpense,
  markPaid,
  getExpenseHistory,
} from '../controllers/expenseController.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';

const router = Router();

router.get('/', authMiddleware, getExpenses);
router.get('/:id', authMiddleware, getExpenseById);
router.get('/:id/history', authMiddleware, getExpenseHistory);

// Create expense
router.post('/', authMiddleware, createExpense);
router.put('/:id', authMiddleware, updateExpense);

// Workflow state transitions
router.post('/:id/submit', authMiddleware, submitExpense);

router.post(
  '/:id/approve',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'FINANCE_ADMIN']),
  approveExpense
);

router.post(
  '/:id/reject',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'FINANCE_ADMIN']),
  rejectExpense
);

router.post(
  '/:id/mark-paid',
  authMiddleware,
  requireRole(['SUPER_ADMIN', 'CENTER_ADMIN', 'FINANCE_ADMIN']),
  markPaid
);

export default router;
