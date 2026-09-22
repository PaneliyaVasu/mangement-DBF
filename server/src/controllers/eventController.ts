import { Response } from 'express';
import { dbStore } from '../services/dataStore.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { eventSchema, scheduleItemSchema, attendanceSchema, expenseSchema } from '../validators/index.ts';
import { Event, EventSchedule, Attendance, Expense, EventTeamAssignment } from '../../../shared/types/index.ts';

export async function getEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;
  const eventType = req.query.eventType as string;
  const locationId = req.query.locationId as string;
  const coordinatorId = req.query.coordinatorId as string;
  const search = (req.query.search as string)?.toLowerCase();
  const year = req.query.year as string;
  const month = req.query.month as string;

  let filtered = [...dbStore.events];

  if (status) {
    filtered = filtered.filter((e) => e.status === status);
  }

  if (eventType) {
    filtered = filtered.filter((e) => e.eventType.toLowerCase() === eventType.toLowerCase());
  }

  if (locationId) {
    filtered = filtered.filter((e) => e.locationId === locationId);
  }

  if (coordinatorId) {
    filtered = filtered.filter((e) => e.primaryCoordinatorId === coordinatorId);
  }

  if (year) {
    filtered = filtered.filter((e) => e.date.startsWith(year));
  }

  if (month) {
    const formattedMonth = month.padStart(2, '0');
    filtered = filtered.filter((e) => {
      const parts = e.date.split('-');
      return parts[1] === formattedMonth;
    });
  }

  if (search) {
    filtered = filtered.filter(
      (e) =>
        e.name.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search) ||
        e.eventType.toLowerCase().includes(search)
    );
  }

  // Sort: upcoming first by date ascending, or archives by date descending
  if (status === 'COMPLETED' || year) {
    filtered.sort((a, b) => b.date.localeCompare(a.date));
  } else {
    filtered.sort((a, b) => a.date.localeCompare(b.date));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  // Enrich with location name and coordinator name
  const enriched = paginated.map((evt) => {
    const loc = dbStore.locations.find((l) => l.id === evt.locationId);
    const coord = dbStore.users.find((u) => u.id === evt.primaryCoordinatorId);
    return {
      ...evt,
      locationName: loc?.name || 'Surat Main Center',
      coordinatorName: coord?.name || 'Coordinator',
    };
  });

  res.json({
    success: true,
    data: enriched,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}

export async function getEventById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const event = dbStore.events.find((e) => e.id === id);

  if (!event) {
    res.status(404).json({ success: false, message: 'Event not found', errorCode: 'EVENT_NOT_FOUND' });
    return;
  }

  const location = dbStore.locations.find((l) => l.id === event.locationId);
  const primaryCoordinator = dbStore.users.find((u) => u.id === event.primaryCoordinatorId);
  const schedules = dbStore.eventSchedules
    .filter((s) => s.eventId === id)
    .sort((a, b) => a.order - b.order);
  const teamAssignments = dbStore.eventTeamAssignments.filter((eta) => eta.eventId === id);
  const assignedTeams = teamAssignments.map((ta) => {
    const team = dbStore.teams.find((t) => t.id === ta.teamId);
    const coord = dbStore.users.find((u) => u.id === ta.coordinatorId);
    return {
      ...ta,
      teamName: team?.name || 'Team',
      coordinatorName: coord?.name || 'Coordinator',
    };
  });

  const mahatmaAssignments = dbStore.eventMahatmaAssignments.filter((ema) => ema.eventId === id);
  const assignedMahatmas = mahatmaAssignments.map((ma) => {
    const mahatma = dbStore.mahatmas.find((m) => m.id === ma.mahatmaId);
    const team = dbStore.teams.find((t) => t.id === ma.teamId);
    return {
      ...ma,
      displayName: mahatma?.displayName || 'Mahatma',
      phone: mahatma?.phone || '',
      teamName: team?.name || 'General',
    };
  });

  const attendanceRecords = dbStore.attendance.filter((a) => a.eventId === id);
  const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
  const absentCount = attendanceRecords.filter((a) => a.status === 'ABSENT').length;
  const registeredCount = attendanceRecords.filter((a) => a.status === 'REGISTERED').length;

  const eventExpenses = dbStore.expenses.filter((e) => e.eventId === id);
  const totalExpense = eventExpenses.reduce((sum, e) => sum + e.amount, 0);

  res.json({
    success: true,
    data: {
      ...event,
      location,
      primaryCoordinator,
      schedules,
      assignedTeams,
      assignedMahatmas,
      attendanceSummary: {
        totalRecords: attendanceRecords.length,
        presentCount,
        absentCount,
        registeredCount,
        expectedAttendance: event.expectedAttendance,
        actualAttendance: event.actualAttendance || presentCount,
        attendancePercentage:
          event.expectedAttendance > 0
            ? Math.round((presentCount / event.expectedAttendance) * 100)
            : 0,
      },
      expenseSummary: {
        count: eventExpenses.length,
        totalAmount: totalExpense,
        items: eventExpenses,
      },
    },
  });
}

export async function createEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validated = eventSchema.parse(req.body);

    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const newEvent: Event = {
      id: `evt-${Date.now()}`,
      centerId: validated.centerId || 'center-surat-01',
      locationId: validated.locationId,
      name: validated.name,
      slug,
      description: validated.description,
      eventType: validated.eventType,
      date: validated.date,
      startTime: validated.startTime,
      endTime: validated.endTime,
      timezone: 'Asia/Kolkata',
      status: validated.status,
      expectedAttendance: validated.expectedAttendance,
      actualAttendance: 0,
      primaryCoordinatorId: validated.primaryCoordinatorId,
      teamIds: validated.teamIds || [],
      bannerImageUrl: validated.bannerImageUrl || 'https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=1200&q=80',
      instructions: validated.instructions,
      createdBy: req.user?.userId || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.events.push(newEvent);

    // Audit Log
    dbStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: req.user?.userId || 'system',
      action: `Created event: ${newEvent.name}`,
      entityType: 'Event',
      entityId: newEvent.id,
      metadata: { date: newEvent.date, status: newEvent.status },
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.errors ? error.errors[0]?.message : error.message,
      errorCode: 'VALIDATION_ERROR',
    });
  }
}

export async function updateEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const event = dbStore.events.find((e) => e.id === id);

  if (!event) {
    res.status(404).json({ success: false, message: 'Event not found', errorCode: 'EVENT_NOT_FOUND' });
    return;
  }

  const { name, description, eventType, date, startTime, endTime, locationId, primaryCoordinatorId, teamIds, instructions, expectedAttendance, bannerImageUrl } = req.body;

  if (name) event.name = name;
  if (description !== undefined) event.description = description;
  if (eventType) event.eventType = eventType;
  if (date) event.date = date;
  if (startTime) event.startTime = startTime;
  if (endTime) event.endTime = endTime;
  if (locationId) event.locationId = locationId;
  if (primaryCoordinatorId) event.primaryCoordinatorId = primaryCoordinatorId;
  if (teamIds) event.teamIds = teamIds;
  if (instructions !== undefined) event.instructions = instructions;
  if (expectedAttendance !== undefined) event.expectedAttendance = Number(expectedAttendance);
  if (bannerImageUrl !== undefined) event.bannerImageUrl = bannerImageUrl;
  event.updatedAt = new Date().toISOString();

  // Audit Log
  dbStore.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: req.user?.userId || 'system',
    action: `Updated event: ${event.name}`,
    entityType: 'Event',
    entityId: event.id,
    metadata: { date: event.date },
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: event,
  });
}

export async function deleteEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const index = dbStore.events.findIndex((e) => e.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Event not found', errorCode: 'EVENT_NOT_FOUND' });
    return;
  }

  const [deleted] = dbStore.events.splice(index, 1);

  // Clean up related sub-records
  dbStore.eventSchedules = dbStore.eventSchedules.filter((s) => s.eventId !== id);
  dbStore.eventTeamAssignments = dbStore.eventTeamAssignments.filter((eta) => eta.eventId !== id);
  dbStore.attendance = dbStore.attendance.filter((a) => a.eventId !== id);

  // Audit Log
  dbStore.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: req.user?.userId || 'system',
    action: `Deleted event: ${deleted.name}`,
    entityType: 'Event',
    entityId: id,
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Event deleted successfully',
  });
}

export async function publishEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const event = dbStore.events.find((e) => e.id === id);
  if (!event) {
    res.status(404).json({ success: false, message: 'Event not found', errorCode: 'EVENT_NOT_FOUND' });
    return;
  }

  event.status = 'PUBLISHED';
  event.updatedAt = new Date().toISOString();

  res.json({ success: true, message: 'Event published', data: event });
}

export async function cancelEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const event = dbStore.events.find((e) => e.id === id);
  if (!event) {
    res.status(404).json({ success: false, message: 'Event not found', errorCode: 'EVENT_NOT_FOUND' });
    return;
  }

  event.status = 'CANCELLED';
  event.updatedAt = new Date().toISOString();

  res.json({ success: true, message: 'Event cancelled', data: event });
}

export async function completeEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const event = dbStore.events.find((e) => e.id === id);
  if (!event) {
    res.status(404).json({ success: false, message: 'Event not found', errorCode: 'EVENT_NOT_FOUND' });
    return;
  }

  event.status = 'COMPLETED';
  // Compute actual attendance from present attendance records
  const present = dbStore.attendance.filter((a) => a.eventId === id && a.status === 'PRESENT').length;
  if (present > 0) {
    event.actualAttendance = present;
  }
  event.updatedAt = new Date().toISOString();

  res.json({ success: true, message: 'Event marked completed and archived', data: event });
}

// Schedule Handlers
export async function getEventSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const schedules = dbStore.eventSchedules
    .filter((s) => s.eventId === id)
    .sort((a, b) => a.order - b.order);
  res.json({ success: true, data: schedules });
}

export async function createEventSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const validated = scheduleItemSchema.parse(req.body);

    const newSchedule: EventSchedule = {
      id: `sch-${Date.now()}`,
      eventId: id,
      title: validated.title,
      description: validated.description,
      startTime: validated.startTime,
      endTime: validated.endTime,
      responsibleCoordinatorId: validated.responsibleCoordinatorId,
      order: validated.order || dbStore.eventSchedules.filter((s) => s.eventId === id).length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.eventSchedules.push(newSchedule);
    res.status(201).json({ success: true, data: newSchedule });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors ? error.errors[0]?.message : error.message });
  }
}

export async function deleteEventSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { scheduleId } = req.params;
  const index = dbStore.eventSchedules.findIndex((s) => s.id === scheduleId);
  if (index === -1) {
    res.status(404).json({ success: false, message: 'Schedule item not found' });
    return;
  }
  dbStore.eventSchedules.splice(index, 1);
  res.json({ success: true, message: 'Schedule item removed' });
}

// Teams in Event
export async function getEventTeams(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const assignments = dbStore.eventTeamAssignments.filter((eta) => eta.eventId === id);
  const detailed = assignments.map((ta) => {
    const team = dbStore.teams.find((t) => t.id === ta.teamId);
    const coord = dbStore.users.find((u) => u.id === ta.coordinatorId);
    return {
      ...ta,
      team,
      coordinator: coord,
    };
  });
  res.json({ success: true, data: detailed });
}

export async function addEventTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { teamId, coordinatorId, responsibility, notes } = req.body;

  if (!teamId || !responsibility) {
    res.status(400).json({ success: false, message: 'Team and responsibility are required' });
    return;
  }

  const newAssignment: EventTeamAssignment = {
    id: `eta-${Date.now()}`,
    eventId: id,
    teamId,
    coordinatorId,
    responsibility,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbStore.eventTeamAssignments.push(newAssignment);

  // Update event's teamIds list if not present
  const event = dbStore.events.find((e) => e.id === id);
  if (event && !event.teamIds.includes(teamId)) {
    event.teamIds.push(teamId);
  }

  res.status(201).json({ success: true, data: newAssignment });
}

// Attendance in Event
export async function getEventAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const records = dbStore.attendance.filter((a) => a.eventId === id);
  const enriched = records.map((att) => {
    const mahatma = dbStore.mahatmas.find((m) => m.id === att.mahatmaId);
    return {
      ...att,
      mahatma,
    };
  });
  res.json({ success: true, data: enriched });
}

export async function recordEventAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { mahatmaId, status } = req.body;

    const existingIndex = dbStore.attendance.findIndex(
      (a) => a.eventId === id && a.mahatmaId === mahatmaId
    );

    let record: Attendance;
    if (existingIndex >= 0) {
      dbStore.attendance[existingIndex].status = status;
      dbStore.attendance[existingIndex].markedBy = req.user?.userId || 'system';
      dbStore.attendance[existingIndex].markedAt = new Date().toISOString();
      record = dbStore.attendance[existingIndex];
    } else {
      record = {
        id: `att-${Date.now()}`,
        eventId: id,
        mahatmaId,
        status,
        markedBy: req.user?.userId || 'system',
        markedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dbStore.attendance.push(record);
    }

    // Recalculate event actual attendance
    const event = dbStore.events.find((e) => e.id === id);
    if (event) {
      event.actualAttendance = dbStore.attendance.filter(
        (a) => a.eventId === id && a.status === 'PRESENT'
      ).length;
    }

    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// Expenses in Event
export async function getEventExpenses(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const expenses = dbStore.expenses.filter((e) => e.eventId === id);
  res.json({ success: true, data: expenses });
}
