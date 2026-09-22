export type UserRole =
  | 'SUPER_ADMIN'
  | 'CENTER_ADMIN'
  | 'FINANCE_ADMIN'
  | 'EVENT_COORDINATOR'
  | 'TEAM_COORDINATOR'
  | 'VOLUNTEER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  role: UserRole;
  centerIds: string[];
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Center {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
  timezone: string;
  logoUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  centerId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  facilities: string[];
  contactName?: string;
  contactPhone?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Event {
  id: string;
  centerId: string;
  locationId: string;
  name: string;
  slug: string;
  description: string;
  eventType: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  timezone: string;
  status: EventStatus;
  expectedAttendance: number;
  actualAttendance?: number;
  primaryCoordinatorId: string;
  teamIds: string[];
  bannerImageUrl?: string;
  instructions?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventType {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventSchedule {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  responsibleCoordinatorId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  centerId: string;
  name: string;
  description?: string;
  primaryCoordinatorId?: string;
  assistantCoordinatorIds: string[];
  memberCount?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TeamMembershipRole = 'MEMBER' | 'ASSISTANT_COORDINATOR' | 'COORDINATOR';

export interface TeamMembership {
  id: string;
  teamId: string;
  mahatmaId: string;
  role: TeamMembershipRole;
  active: boolean;
  joinedAt: string;
  leftAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type MahatmaStatus = 'ACTIVE' | 'INACTIVE';

export interface Mahatma {
  id: string;
  centerId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  status: MahatmaStatus;
  availability?: string;
  notes?: string;
  active: boolean;
  teamIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EventTeamAssignment {
  id: string;
  eventId: string;
  teamId: string;
  coordinatorId?: string;
  responsibility: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventMahatmaAssignment {
  id: string;
  eventId: string;
  mahatmaId: string;
  teamId?: string;
  responsibility: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'REGISTERED' | 'PRESENT' | 'ABSENT';

export interface Attendance {
  id: string;
  eventId: string;
  mahatmaId: string;
  status: AttendanceStatus;
  markedBy: string;
  markedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface Expense {
  id: string;
  centerId: string;
  eventId?: string;
  teamId?: string;
  locationId?: string;
  title: string;
  description?: string;
  category: string;
  amount: number;
  currency: string;
  expenseDate: string;
  paidBy: string;
  paymentMethod: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  submittedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseHistoryAction =
  | 'CREATED'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'MARKED_PAID'
  | 'UPDATED';

export interface ExpenseHistory {
  id: string;
  expenseId: string;
  action: ExpenseHistoryAction;
  performedBy: string;
  previousStatus?: ExpenseStatus;
  newStatus?: ExpenseStatus;
  note?: string;
  createdAt: string;
}

export type NotificationType =
  | 'EVENT_ASSIGNED'
  | 'COORDINATOR_ASSIGNED'
  | 'EXPENSE_SUBMITTED'
  | 'EXPENSE_APPROVED'
  | 'EXPENSE_REJECTED'
  | 'EVENT_REMINDER'
  | 'ATTENDANCE_REMINDER';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
  pagination?: PaginationMeta;
}
