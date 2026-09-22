import { Response } from 'express';
import { dbStore } from '../services/dataStore.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { EventType, ExpenseCategory } from '../../../shared/types/index.ts';

export async function getCenterInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
  const center = dbStore.centers[0];
  res.json({ success: true, data: center });
}

export async function updateCenterInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
  const center = dbStore.centers[0];
  if (!center) {
    res.status(404).json({ success: false, message: 'Center record not found' });
    return;
  }

  const { name, description, address, city, state, postalCode, phone, email, timezone } = req.body;
  if (name) center.name = name;
  if (description !== undefined) center.description = description;
  if (address) center.address = address;
  if (city) center.city = city;
  if (state) center.state = state;
  if (postalCode) center.postalCode = postalCode;
  if (phone) center.phone = phone;
  if (email) center.email = email;
  if (timezone) center.timezone = timezone;
  center.updatedAt = new Date().toISOString();

  res.json({ success: true, data: center });
}

export async function getEventTypes(req: AuthenticatedRequest, res: Response): Promise<void> {
  res.json({ success: true, data: dbStore.eventTypes });
}

export async function createEventType(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: 'Name is required' });
    return;
  }

  const newType: EventType = {
    id: `et-${Date.now()}`,
    name,
    description,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbStore.eventTypes.push(newType);
  res.status(201).json({ success: true, data: newType });
}

export async function getExpenseCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
  res.json({ success: true, data: dbStore.expenseCategories });
}

export async function createExpenseCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: 'Name is required' });
    return;
  }

  const newCat: ExpenseCategory = {
    id: `cat-${Date.now()}`,
    name,
    description,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbStore.expenseCategories.push(newCat);
  res.status(201).json({ success: true, data: newCat });
}

export async function getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  const users = dbStore.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    active: u.active,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
  }));
  res.json({ success: true, data: users });
}

export async function updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { role, active } = req.body;

  const user = dbStore.users.find((u) => u.id === id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (role) user.role = role;
  if (active !== undefined) user.active = active;
  user.updatedAt = new Date().toISOString();

  res.json({ success: true, data: user });
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 30;

  const total = dbStore.auditLogs.length;
  const offset = (page - 1) * limit;
  const paginated = dbStore.auditLogs.slice(offset, offset + limit);

  const enriched = paginated.map((log) => {
    const user = dbStore.users.find((u) => u.id === log.userId);
    return {
      ...log,
      userName: user?.name || 'System Admin',
      userEmail: user?.email || '',
    };
  });

  res.json({
    success: true,
    data: enriched,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
}
