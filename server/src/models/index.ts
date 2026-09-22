import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUserDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  photoUrl?: string;
  role: string;
  centerIds: string[];
  active: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    photoUrl: { type: String },
    role: {
      type: String,
      enum: [
        'SUPER_ADMIN',
        'CENTER_ADMIN',
        'FINANCE_ADMIN',
        'EVENT_COORDINATOR',
        'TEAM_COORDINATOR',
        'VOLUNTEER',
      ],
      default: 'VOLUNTEER',
      index: true,
    },
    centerIds: [{ type: String, index: true }],
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Center Schema
export interface ICenterDocument extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const CenterSchema = new Schema<ICenterDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    postalCode: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    timezone: { type: String, default: 'Asia/Kolkata' },
    logoUrl: { type: String },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Location Schema
export interface ILocationDocument extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocationDocument>(
  {
    centerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    capacity: { type: Number, default: 0 },
    facilities: [{ type: String }],
    contactName: { type: String },
    contactPhone: { type: String },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Event Schema
export interface IEventDocument extends Document {
  centerId: string;
  locationId: string;
  name: string;
  slug: string;
  description: string;
  eventType: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  status: string;
  expectedAttendance: number;
  actualAttendance?: number;
  primaryCoordinatorId: string;
  teamIds: string[];
  bannerImageUrl?: string;
  instructions?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEventDocument>(
  {
    centerId: { type: String, required: true },
    locationId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: '' },
    eventType: { type: String, required: true, index: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    timezone: { type: String, default: 'Asia/Kolkata' },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT',
    },
    expectedAttendance: { type: Number, default: 0 },
    actualAttendance: { type: Number, default: 0 },
    primaryCoordinatorId: { type: String, required: true, index: true },
    teamIds: [{ type: String }],
    bannerImageUrl: { type: String },
    instructions: { type: String },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

EventSchema.index({ centerId: 1, date: 1 });
EventSchema.index({ locationId: 1, date: 1 });
EventSchema.index({ status: 1, date: 1 });

// EventType Schema
export interface IEventTypeDocument extends Document {
  name: string;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventTypeSchema = new Schema<IEventTypeDocument>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// EventSchedule Schema
export interface IEventScheduleDocument extends Document {
  eventId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  responsibleCoordinatorId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventScheduleSchema = new Schema<IEventScheduleDocument>(
  {
    eventId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    responsibleCoordinatorId: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

EventScheduleSchema.index({ eventId: 1, order: 1 });

// Team Schema
export interface ITeamDocument extends Document {
  centerId: string;
  name: string;
  description?: string;
  primaryCoordinatorId?: string;
  assistantCoordinatorIds: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeamDocument>(
  {
    centerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    primaryCoordinatorId: { type: String, index: true },
    assistantCoordinatorIds: [{ type: String }],
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// TeamMembership Schema
export interface ITeamMembershipDocument extends Document {
  teamId: string;
  mahatmaId: string;
  role: string;
  active: boolean;
  joinedAt: Date;
  leftAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMembershipSchema = new Schema<ITeamMembershipDocument>(
  {
    teamId: { type: String, required: true, index: true },
    mahatmaId: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ['MEMBER', 'ASSISTANT_COORDINATOR', 'COORDINATOR'],
      default: 'MEMBER',
    },
    active: { type: Boolean, default: true, index: true },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
  },
  { timestamps: true }
);

TeamMembershipSchema.index({ teamId: 1, mahatmaId: 1 });

// Mahatma Schema
export interface IMahatmaDocument extends Document {
  centerId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  status: string;
  availability?: string;
  notes?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MahatmaSchema = new Schema<IMahatmaDocument>(
  {
    centerId: { type: String, required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    displayName: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    email: { type: String, index: true },
    photoUrl: { type: String },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
    availability: { type: String },
    notes: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// EventTeamAssignment Schema
export interface IEventTeamAssignmentDocument extends Document {
  eventId: string;
  teamId: string;
  coordinatorId?: string;
  responsibility: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventTeamAssignmentSchema = new Schema<IEventTeamAssignmentDocument>(
  {
    eventId: { type: String, required: true, index: true },
    teamId: { type: String, required: true, index: true },
    coordinatorId: { type: String },
    responsibility: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

// EventMahatmaAssignment Schema
export interface IEventMahatmaAssignmentDocument extends Document {
  eventId: string;
  mahatmaId: string;
  teamId?: string;
  responsibility: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventMahatmaAssignmentSchema = new Schema<IEventMahatmaAssignmentDocument>(
  {
    eventId: { type: String, required: true, index: true },
    mahatmaId: { type: String, required: true, index: true },
    teamId: { type: String },
    responsibility: { type: String, required: true },
    status: { type: String, default: 'ASSIGNED' },
  },
  { timestamps: true }
);

// Attendance Schema
export interface IAttendanceDocument extends Document {
  eventId: string;
  mahatmaId: string;
  status: string;
  markedBy: string;
  markedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendanceDocument>(
  {
    eventId: { type: String, required: true, index: true },
    mahatmaId: { type: String, required: true, index: true },
    status: { type: String, enum: ['REGISTERED', 'PRESENT', 'ABSENT'], default: 'REGISTERED' },
    markedBy: { type: String, required: true },
    markedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AttendanceSchema.index({ eventId: 1, mahatmaId: 1 }, { unique: true });

// Expense Schema
export interface IExpenseDocument extends Document {
  centerId: string;
  eventId?: string;
  teamId?: string;
  title: string;
  description?: string;
  category: string;
  amount: number;
  currency: string;
  expenseDate: string;
  paidBy: string;
  paymentMethod: string;
  receiptUrl?: string;
  status: string;
  submittedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  paidAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    centerId: { type: String, required: true },
    eventId: { type: String, index: true },
    teamId: { type: String, index: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: 'INR' },
    expenseDate: { type: String, required: true },
    paidBy: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    receiptUrl: { type: String },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID'],
      default: 'DRAFT',
      index: true,
    },
    submittedBy: { type: String, required: true },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    paidAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

ExpenseSchema.index({ centerId: 1, expenseDate: 1 });

// ExpenseCategory Schema
export interface IExpenseCategoryDocument extends Document {
  name: string;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseCategorySchema = new Schema<IExpenseCategoryDocument>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ExpenseHistory Schema
export interface IExpenseHistoryDocument extends Document {
  expenseId: string;
  action: string;
  performedBy: string;
  previousStatus?: string;
  newStatus?: string;
  note?: string;
  createdAt: Date;
}

const ExpenseHistorySchema = new Schema<IExpenseHistoryDocument>(
  {
    expenseId: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: ['CREATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'MARKED_PAID', 'UPDATED'],
      required: true,
    },
    performedBy: { type: String, required: true },
    previousStatus: { type: String },
    newStatus: { type: String },
    note: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Notification Schema
export interface INotificationDocument extends Document {
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, read: 1 });

// AuditLog Schema
export interface IAuditLogDocument extends Document {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ entityType: 1, entityId: 1 });

// Export Models
export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
export const CenterModel = mongoose.models.Center || mongoose.model<ICenterDocument>('Center', CenterSchema);
export const LocationModel = mongoose.models.Location || mongoose.model<ILocationDocument>('Location', LocationSchema);
export const EventModel = mongoose.models.Event || mongoose.model<IEventDocument>('Event', EventSchema);
export const EventTypeModel = mongoose.models.EventType || mongoose.model<IEventTypeDocument>('EventType', EventTypeSchema);
export const EventScheduleModel = mongoose.models.EventSchedule || mongoose.model<IEventScheduleDocument>('EventSchedule', EventScheduleSchema);
export const TeamModel = mongoose.models.Team || mongoose.model<ITeamDocument>('Team', TeamSchema);
export const TeamMembershipModel = mongoose.models.TeamMembership || mongoose.model<ITeamMembershipDocument>('TeamMembership', TeamMembershipSchema);
export const MahatmaModel = mongoose.models.Mahatma || mongoose.model<IMahatmaDocument>('Mahatma', MahatmaSchema);
export const EventTeamAssignmentModel = mongoose.models.EventTeamAssignment || mongoose.model<IEventTeamAssignmentDocument>('EventTeamAssignment', EventTeamAssignmentSchema);
export const EventMahatmaAssignmentModel = mongoose.models.EventMahatmaAssignment || mongoose.model<IEventMahatmaAssignmentDocument>('EventMahatmaAssignment', EventMahatmaAssignmentSchema);
export const AttendanceModel = mongoose.models.Attendance || mongoose.model<IAttendanceDocument>('Attendance', AttendanceSchema);
export const ExpenseModel = mongoose.models.Expense || mongoose.model<IExpenseDocument>('Expense', ExpenseSchema);
export const ExpenseCategoryModel = mongoose.models.ExpenseCategory || mongoose.model<IExpenseCategoryDocument>('ExpenseCategory', ExpenseCategorySchema);
export const ExpenseHistoryModel = mongoose.models.ExpenseHistory || mongoose.model<IExpenseHistoryDocument>('ExpenseHistory', ExpenseHistorySchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
