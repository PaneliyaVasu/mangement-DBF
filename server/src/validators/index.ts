import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z
    .enum([
      'SUPER_ADMIN',
      'CENTER_ADMIN',
      'FINANCE_ADMIN',
      'EVENT_COORDINATOR',
      'TEAM_COORDINATOR',
      'VOLUNTEER',
    ])
    .default('VOLUNTEER'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const eventSchema = z
  .object({
    name: z.string().min(3, 'Event name must be at least 3 characters'),
    description: z.string().default(''),
    eventType: z.string().min(1, 'Event type is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be formatted as HH:MM'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be formatted as HH:MM'),
    locationId: z.string().min(1, 'Location is required'),
    primaryCoordinatorId: z.string().min(1, 'Primary coordinator is required'),
    centerId: z.string().default('center-surat-01'),
    expectedAttendance: z.coerce.number().min(0).default(0),
    teamIds: z.array(z.string()).default([]),
    instructions: z.string().optional(),
    bannerImageUrl: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
  })
  .refine(
    (data) => {
      // Validate end time is after start time
      return data.endTime > data.startTime;
    },
    {
      message: 'End time cannot be before or equal to start time',
      path: ['endTime'],
    }
  );

export const expenseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  currency: z.string().default('INR'),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expense date must be formatted as YYYY-MM-DD'),
  paidBy: z.string().min(1, 'Paid by person name is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  eventId: z.string().optional(),
  teamId: z.string().optional(),
  receiptUrl: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID']).default('DRAFT'),
});

export const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().optional(),
  primaryCoordinatorId: z.string().optional(),
  assistantCoordinatorIds: z.array(z.string()).default([]),
  centerId: z.string().default('center-surat-01'),
  active: z.boolean().default(true),
});

export const mahatmaSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  availability: z.string().optional(),
  notes: z.string().optional(),
  teamIds: z.array(z.string()).default([]),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  centerId: z.string().default('center-surat-01'),
});

export const locationSchema = z.object({
  name: z.string().min(2, 'Location name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().default('Surat'),
  state: z.string().default('Gujarat'),
  postalCode: z.string().min(6, 'Postal code is required'),
  capacity: z.coerce.number().min(0).default(100),
  facilities: z.array(z.string()).default([]),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  centerId: z.string().default('center-surat-01'),
});

export const scheduleItemSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be formatted as HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be formatted as HH:MM'),
  responsibleCoordinatorId: z.string().optional(),
  order: z.coerce.number().default(0),
});

export const attendanceSchema = z.object({
  mahatmaId: z.string().min(1, 'Mahatma ID is required'),
  status: z.enum(['REGISTERED', 'PRESENT', 'ABSENT']),
});
