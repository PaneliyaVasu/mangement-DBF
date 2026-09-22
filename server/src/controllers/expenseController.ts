import { Response } from 'express';
import { dbStore } from '../services/dataStore.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { expenseSchema } from '../validators/index.ts';
import { Expense, ExpenseHistory } from '../../../shared/types/index.ts';

export async function getExpenses(req: AuthenticatedRequest, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;
  const category = req.query.category as string;
  const eventId = req.query.eventId as string;
  const teamId = req.query.teamId as string;
  const search = (req.query.search as string)?.toLowerCase();

  let filtered = [...dbStore.expenses];

  if (status) {
    filtered = filtered.filter((e) => e.status === status);
  }

  if (category) {
    filtered = filtered.filter((e) => e.category.toLowerCase() === category.toLowerCase());
  }

  if (eventId) {
    filtered = filtered.filter((e) => e.eventId === eventId);
  }

  if (teamId) {
    filtered = filtered.filter((e) => e.teamId === teamId);
  }

  if (search) {
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(search) ||
        (e.description && e.description.toLowerCase().includes(search)) ||
        e.paidBy.toLowerCase().includes(search)
    );
  }

  filtered.sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  // Enrich with event and team names
  const enriched = paginated.map((exp) => {
    const event = dbStore.events.find((e) => e.id === exp.eventId);
    const team = dbStore.teams.find((t) => t.id === exp.teamId);
    const submitter = dbStore.users.find((u) => u.id === exp.submittedBy);
    return {
      ...exp,
      eventName: event?.name || 'General Center',
      teamName: team?.name || 'General',
      submittedByName: submitter?.name || 'User',
    };
  });

  // Calculate summary metrics for the current view
  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = filtered
    .filter((e) => e.status === 'SUBMITTED')
    .reduce((sum, e) => sum + e.amount, 0);
  const approvedAmount = filtered
    .filter((e) => e.status === 'APPROVED')
    .reduce((sum, e) => sum + e.amount, 0);
  const paidAmount = filtered
    .filter((e) => e.status === 'PAID')
    .reduce((sum, e) => sum + e.amount, 0);

  res.json({
    success: true,
    data: enriched,
    summary: {
      totalAmount,
      pendingAmount,
      approvedAmount,
      paidAmount,
      totalCount: total,
    },
    pagination: { page, limit, total, totalPages },
  });
}

export async function getExpenseById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const expense = dbStore.expenses.find((e) => e.id === id);

  if (!expense) {
    res.status(404).json({ success: false, message: 'Expense not found', errorCode: 'EXPENSE_NOT_FOUND' });
    return;
  }

  const event = dbStore.events.find((e) => e.id === expense.eventId);
  const team = dbStore.teams.find((t) => t.id === expense.teamId);
  const submitter = dbStore.users.find((u) => u.id === expense.submittedBy);
  const approver = dbStore.users.find((u) => u.id === expense.approvedBy);
  const history = dbStore.expenseHistory
    .filter((h) => h.expenseId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json({
    success: true,
    data: {
      ...expense,
      event,
      team,
      submitter,
      approver,
      history,
    },
  });
}

export async function createExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validated = expenseSchema.parse(req.body);

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      centerId: 'center-surat-01',
      eventId: validated.eventId || undefined,
      teamId: validated.teamId || undefined,
      title: validated.title,
      description: validated.description,
      category: validated.category,
      amount: validated.amount,
      currency: validated.currency || 'INR',
      expenseDate: validated.expenseDate,
      paidBy: validated.paidBy,
      paymentMethod: validated.paymentMethod,
      receiptUrl: validated.receiptUrl,
      status: validated.status || 'DRAFT',
      submittedBy: req.user?.userId || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.expenses.push(newExpense);

    // Initial History
    dbStore.expenseHistory.push({
      id: `eh-${Date.now()}-1`,
      expenseId: newExpense.id,
      action: 'CREATED',
      performedBy: req.user?.userId || 'system',
      newStatus: newExpense.status,
      note: 'Expense recorded',
      createdAt: new Date().toISOString(),
    });

    if (newExpense.status === 'SUBMITTED') {
      dbStore.expenseHistory.push({
        id: `eh-${Date.now()}-2`,
        expenseId: newExpense.id,
        action: 'SUBMITTED',
        performedBy: req.user?.userId || 'system',
        previousStatus: 'DRAFT',
        newStatus: 'SUBMITTED',
        note: 'Submitted for finance approval',
        createdAt: new Date().toISOString(),
      });
    }

    dbStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: req.user?.userId || 'system',
      action: `Created expense: ${newExpense.title} (₹${newExpense.amount})`,
      entityType: 'Expense',
      entityId: newExpense.id,
      metadata: { amount: newExpense.amount, category: newExpense.category },
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: newExpense });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors ? error.errors[0]?.message : error.message });
  }
}

export async function updateExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const expense = dbStore.expenses.find((e) => e.id === id);

  if (!expense) {
    res.status(404).json({ success: false, message: 'Expense not found' });
    return;
  }

  const { title, description, category, amount, expenseDate, paidBy, paymentMethod, receiptUrl, eventId, teamId } = req.body;
  if (title) expense.title = title;
  if (description !== undefined) expense.description = description;
  if (category) expense.category = category;
  if (amount) expense.amount = Number(amount);
  if (expenseDate) expense.expenseDate = expenseDate;
  if (paidBy) expense.paidBy = paidBy;
  if (paymentMethod) expense.paymentMethod = paymentMethod;
  if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;
  if (eventId !== undefined) expense.eventId = eventId;
  if (teamId !== undefined) expense.teamId = teamId;
  expense.updatedAt = new Date().toISOString();

  dbStore.expenseHistory.push({
    id: `eh-${Date.now()}`,
    expenseId: expense.id,
    action: 'UPDATED',
    performedBy: req.user?.userId || 'system',
    note: 'Expense details updated',
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, data: expense });
}

export async function submitExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const expense = dbStore.expenses.find((e) => e.id === id);

  if (!expense) {
    res.status(404).json({ success: false, message: 'Expense not found' });
    return;
  }

  const previous = expense.status;
  expense.status = 'SUBMITTED';
  expense.updatedAt = new Date().toISOString();

  dbStore.expenseHistory.push({
    id: `eh-${Date.now()}`,
    expenseId: expense.id,
    action: 'SUBMITTED',
    performedBy: req.user?.userId || 'system',
    previousStatus: previous,
    newStatus: 'SUBMITTED',
    note: 'Submitted for approval',
    createdAt: new Date().toISOString(),
  });

  // Notify finance admins
  const financeUsers = dbStore.users.filter(
    (u) => u.role === 'FINANCE_ADMIN' || u.role === 'SUPER_ADMIN'
  );
  financeUsers.forEach((fu) => {
    dbStore.notifications.unshift({
      id: `notif-${Date.now()}-${fu.id}`,
      userId: fu.id,
      type: 'EXPENSE_SUBMITTED',
      title: 'Expense Submitted for Approval',
      message: `${expense.title} (₹${expense.amount.toLocaleString('en-IN')}) requires your review.`,
      entityType: 'Expense',
      entityId: expense.id,
      read: false,
      createdAt: new Date().toISOString(),
    });
  });

  res.json({ success: true, message: 'Expense submitted for approval', data: expense });
}

export async function approveExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const expense = dbStore.expenses.find((e) => e.id === id);

  if (!expense) {
    res.status(404).json({ success: false, message: 'Expense not found' });
    return;
  }

  const previous = expense.status;
  expense.status = 'APPROVED';
  expense.approvedBy = req.user?.userId || 'system';
  expense.approvedAt = new Date().toISOString();
  expense.updatedAt = new Date().toISOString();

  dbStore.expenseHistory.push({
    id: `eh-${Date.now()}`,
    expenseId: expense.id,
    action: 'APPROVED',
    performedBy: req.user?.userId || 'system',
    previousStatus: previous,
    newStatus: 'APPROVED',
    note: 'Approved for disbursement',
    createdAt: new Date().toISOString(),
  });

  // Notify submitter
  dbStore.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: expense.submittedBy,
    type: 'EXPENSE_APPROVED',
    title: 'Expense Approved',
    message: `Your expense "${expense.title}" of ₹${expense.amount.toLocaleString('en-IN')} has been approved.`,
    entityType: 'Expense',
    entityId: expense.id,
    read: false,
    createdAt: new Date().toISOString(),
  });

  dbStore.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: req.user?.userId || 'system',
    action: `Approved expense: ${expense.title}`,
    entityType: 'Expense',
    entityId: expense.id,
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Expense approved', data: expense });
}

export async function rejectExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason || !rejectionReason.trim()) {
    res.status(400).json({ success: false, message: 'Rejection reason is required' });
    return;
  }

  const expense = dbStore.expenses.find((e) => e.id === id);
  if (!expense) {
    res.status(404).json({ success: false, message: 'Expense not found' });
    return;
  }

  const previous = expense.status;
  expense.status = 'REJECTED';
  expense.rejectionReason = rejectionReason;
  expense.updatedAt = new Date().toISOString();

  dbStore.expenseHistory.push({
    id: `eh-${Date.now()}`,
    expenseId: expense.id,
    action: 'REJECTED',
    performedBy: req.user?.userId || 'system',
    previousStatus: previous,
    newStatus: 'REJECTED',
    note: `Reason: ${rejectionReason}`,
    createdAt: new Date().toISOString(),
  });

  // Notify submitter
  dbStore.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: expense.submittedBy,
    type: 'EXPENSE_REJECTED',
    title: 'Expense Rejected',
    message: `Your expense "${expense.title}" was rejected: ${rejectionReason}`,
    entityType: 'Expense',
    entityId: expense.id,
    read: false,
    createdAt: new Date().toISOString(),
  });

  dbStore.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: req.user?.userId || 'system',
    action: `Rejected expense: ${expense.title}`,
    entityType: 'Expense',
    entityId: expense.id,
    metadata: { rejectionReason },
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Expense rejected', data: expense });
}

export async function markPaid(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const expense = dbStore.expenses.find((e) => e.id === id);

  if (!expense) {
    res.status(404).json({ success: false, message: 'Expense not found' });
    return;
  }

  const previous = expense.status;
  expense.status = 'PAID';
  expense.paidAt = new Date().toISOString();
  expense.updatedAt = new Date().toISOString();

  dbStore.expenseHistory.push({
    id: `eh-${Date.now()}`,
    expenseId: expense.id,
    action: 'MARKED_PAID',
    performedBy: req.user?.userId || 'system',
    previousStatus: previous,
    newStatus: 'PAID',
    note: 'Disbursed and marked paid',
    createdAt: new Date().toISOString(),
  });

  dbStore.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: req.user?.userId || 'system',
    action: `Marked expense paid: ${expense.title}`,
    entityType: 'Expense',
    entityId: expense.id,
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Expense marked as paid', data: expense });
}

export async function getExpenseHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const history = dbStore.expenseHistory
    .filter((h) => h.expenseId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json({ success: true, data: history });
}
