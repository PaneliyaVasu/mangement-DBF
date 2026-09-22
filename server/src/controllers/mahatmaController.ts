import { Response } from 'express';
import { dbStore } from '../services/dataStore.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { mahatmaSchema } from '../validators/index.ts';
import { Mahatma } from '../../../shared/types/index.ts';

export async function getMahatmas(req: AuthenticatedRequest, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = (req.query.search as string)?.toLowerCase();
  const teamId = req.query.teamId as string;
  const status = req.query.status as string;

  let filtered = [...dbStore.mahatmas];

  if (status) {
    filtered = filtered.filter((m) => m.status === status);
  }

  if (teamId) {
    filtered = filtered.filter((m) => {
      const isMember = dbStore.teamMemberships.some(
        (tm) => tm.teamId === teamId && tm.mahatmaId === m.id && tm.active
      );
      return isMember || m.teamIds?.includes(teamId);
    });
  }

  if (search) {
    filtered = filtered.filter(
      (m) =>
        m.displayName.toLowerCase().includes(search) ||
        m.phone.includes(search) ||
        (m.email && m.email.toLowerCase().includes(search))
    );
  }

  filtered.sort((a, b) => a.displayName.localeCompare(b.displayName));

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  // Enrich with teams list
  const enriched = paginated.map((m) => {
    const memberships = dbStore.teamMemberships.filter((tm) => tm.mahatmaId === m.id && tm.active);
    const teams = memberships.map((tm) => {
      const team = dbStore.teams.find((t) => t.id === tm.teamId);
      return {
        id: tm.teamId,
        name: team?.name || 'Team',
        role: tm.role,
      };
    });
    return {
      ...m,
      teams,
    };
  });

  res.json({
    success: true,
    data: enriched,
    pagination: { page, limit, total, totalPages },
  });
}

export async function getMahatmaById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const mahatma = dbStore.mahatmas.find((m) => m.id === id);

  if (!mahatma) {
    res.status(404).json({ success: false, message: 'Mahatma not found', errorCode: 'MAHATMA_NOT_FOUND' });
    return;
  }

  const memberships = dbStore.teamMemberships.filter((tm) => tm.mahatmaId === id && tm.active);
  const teams = memberships.map((tm) => {
    const team = dbStore.teams.find((t) => t.id === tm.teamId);
    return {
      ...tm,
      team,
    };
  });

  const attendanceRecords = dbStore.attendance.filter((a) => a.mahatmaId === id);
  const enrichedAttendance = attendanceRecords.map((att) => {
    const event = dbStore.events.find((e) => e.id === att.eventId);
    return {
      ...att,
      event,
    };
  });

  const assignments = dbStore.eventMahatmaAssignments.filter((ema) => ema.mahatmaId === id);
  const enrichedAssignments = assignments.map((ema) => {
    const event = dbStore.events.find((e) => e.id === ema.eventId);
    const team = dbStore.teams.find((t) => t.id === ema.teamId);
    return {
      ...ema,
      event,
      team,
    };
  });

  res.json({
    success: true,
    data: {
      ...mahatma,
      teams,
      attendance: enrichedAttendance,
      responsibilities: enrichedAssignments,
    },
  });
}

export async function createMahatma(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validated = mahatmaSchema.parse(req.body);

    const newMahatma: Mahatma = {
      id: `mah-${Date.now()}`,
      centerId: validated.centerId || 'center-surat-01',
      firstName: validated.firstName,
      lastName: validated.lastName,
      displayName: `${validated.firstName} ${validated.lastName}`,
      phone: validated.phone,
      email: validated.email || undefined,
      status: validated.status || 'ACTIVE',
      availability: validated.availability,
      notes: validated.notes,
      teamIds: validated.teamIds || [],
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.mahatmas.push(newMahatma);

    // If teams were assigned, create memberships
    if (validated.teamIds && validated.teamIds.length > 0) {
      validated.teamIds.forEach((tId) => {
        dbStore.teamMemberships.push({
          id: `tm-${Date.now()}-${tId}`,
          teamId: tId,
          mahatmaId: newMahatma.id,
          role: 'MEMBER',
          active: true,
          joinedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    }

    dbStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: req.user?.userId || 'system',
      action: `Added Mahatma: ${newMahatma.displayName}`,
      entityType: 'Mahatma',
      entityId: newMahatma.id,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: newMahatma });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors ? error.errors[0]?.message : error.message });
  }
}

export async function updateMahatma(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const mahatma = dbStore.mahatmas.find((m) => m.id === id);

  if (!mahatma) {
    res.status(404).json({ success: false, message: 'Mahatma not found' });
    return;
  }

  const { firstName, lastName, phone, email, status, availability, notes, teamIds } = req.body;
  if (firstName) mahatma.firstName = firstName;
  if (lastName) mahatma.lastName = lastName;
  if (firstName || lastName) mahatma.displayName = `${mahatma.firstName} ${mahatma.lastName}`;
  if (phone) mahatma.phone = phone;
  if (email !== undefined) mahatma.email = email;
  if (status) mahatma.status = status;
  if (availability !== undefined) mahatma.availability = availability;
  if (notes !== undefined) mahatma.notes = notes;
  if (teamIds) mahatma.teamIds = teamIds;
  mahatma.updatedAt = new Date().toISOString();

  res.json({ success: true, data: mahatma });
}

export async function deleteMahatma(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const index = dbStore.mahatmas.findIndex((m) => m.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Mahatma not found' });
    return;
  }

  const [deleted] = dbStore.mahatmas.splice(index, 1);
  dbStore.teamMemberships = dbStore.teamMemberships.filter((tm) => tm.mahatmaId !== id);

  res.json({ success: true, message: 'Mahatma removed' });
}
