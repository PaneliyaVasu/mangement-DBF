import { Response } from 'express';
import { dbStore } from '../services/dataStore.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { teamSchema } from '../validators/index.ts';
import { Team, TeamMembership } from '../../../shared/types/index.ts';

export async function getTeams(req: AuthenticatedRequest, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = (req.query.search as string)?.toLowerCase();
  const active = req.query.active !== 'false';

  let filtered = dbStore.teams.filter((t) => (active ? t.active : true));

  if (search) {
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        (t.description && t.description.toLowerCase().includes(search))
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  const enriched = paginated.map((team) => {
    const coordinator = dbStore.users.find((u) => u.id === team.primaryCoordinatorId);
    const membershipCount = dbStore.teamMemberships.filter(
      (tm) => tm.teamId === team.id && tm.active
    ).length;
    return {
      ...team,
      primaryCoordinatorName: coordinator?.name || 'Unassigned',
      memberCount: team.memberCount || membershipCount,
    };
  });

  res.json({
    success: true,
    data: enriched,
    pagination: { page, limit, total, totalPages },
  });
}

export async function getTeamById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const team = dbStore.teams.find((t) => t.id === id);

  if (!team) {
    res.status(404).json({ success: false, message: 'Team not found', errorCode: 'TEAM_NOT_FOUND' });
    return;
  }

  const coordinator = dbStore.users.find((u) => u.id === team.primaryCoordinatorId);
  const assistantCoordinators = dbStore.users.filter((u) =>
    team.assistantCoordinatorIds.includes(u.id)
  );

  // Members
  const memberships = dbStore.teamMemberships.filter((tm) => tm.teamId === id && tm.active);
  const members = memberships.map((tm) => {
    const mahatma = dbStore.mahatmas.find((m) => m.id === tm.mahatmaId);
    return {
      ...tm,
      mahatma,
    };
  });

  // Upcoming and past events
  const assignedEvents = dbStore.events.filter(
    (e) =>
      e.teamIds.includes(id) ||
      dbStore.eventTeamAssignments.some((eta) => eta.eventId === e.id && eta.teamId === id)
  );

  res.json({
    success: true,
    data: {
      ...team,
      coordinator,
      assistantCoordinators,
      members,
      events: assignedEvents,
    },
  });
}

export async function createTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validated = teamSchema.parse(req.body);

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      centerId: validated.centerId || 'center-surat-01',
      name: validated.name,
      description: validated.description,
      primaryCoordinatorId: validated.primaryCoordinatorId,
      assistantCoordinatorIds: validated.assistantCoordinatorIds || [],
      memberCount: 0,
      active: validated.active !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.teams.push(newTeam);

    dbStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: req.user?.userId || 'system',
      action: `Created team: ${newTeam.name}`,
      entityType: 'Team',
      entityId: newTeam.id,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: newTeam });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors ? error.errors[0]?.message : error.message });
  }
}

export async function updateTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const team = dbStore.teams.find((t) => t.id === id);

  if (!team) {
    res.status(404).json({ success: false, message: 'Team not found' });
    return;
  }

  const { name, description, primaryCoordinatorId, assistantCoordinatorIds, active } = req.body;
  if (name) team.name = name;
  if (description !== undefined) team.description = description;
  if (primaryCoordinatorId !== undefined) team.primaryCoordinatorId = primaryCoordinatorId;
  if (assistantCoordinatorIds) team.assistantCoordinatorIds = assistantCoordinatorIds;
  if (active !== undefined) team.active = active;
  team.updatedAt = new Date().toISOString();

  res.json({ success: true, data: team });
}

export async function deleteTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const index = dbStore.teams.findIndex((t) => t.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Team not found' });
    return;
  }

  const [deleted] = dbStore.teams.splice(index, 1);
  dbStore.teamMemberships = dbStore.teamMemberships.filter((tm) => tm.teamId !== id);

  res.json({ success: true, message: 'Team deleted' });
}

export async function addTeamMember(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { mahatmaId, role } = req.body;

  if (!mahatmaId) {
    res.status(400).json({ success: false, message: 'Mahatma ID is required' });
    return;
  }

  const existing = dbStore.teamMemberships.find(
    (tm) => tm.teamId === id && tm.mahatmaId === mahatmaId && tm.active
  );
  if (existing) {
    res.status(409).json({ success: false, message: 'Mahatma is already a member of this team' });
    return;
  }

  const newMembership: TeamMembership = {
    id: `tm-${Date.now()}`,
    teamId: id,
    mahatmaId,
    role: role || 'MEMBER',
    active: true,
    joinedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbStore.teamMemberships.push(newMembership);

  // Update team memberCount
  const team = dbStore.teams.find((t) => t.id === id);
  if (team) {
    team.memberCount = dbStore.teamMemberships.filter((tm) => tm.teamId === id && tm.active).length;
  }

  // Update mahatma teamIds list
  const mahatma = dbStore.mahatmas.find((m) => m.id === mahatmaId);
  if (mahatma && !mahatma.teamIds?.includes(id)) {
    mahatma.teamIds = [...(mahatma.teamIds || []), id];
  }

  res.status(201).json({ success: true, data: newMembership });
}

export async function removeTeamMember(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id, mahatmaId } = req.params;
  const index = dbStore.teamMemberships.findIndex(
    (tm) => tm.teamId === id && tm.mahatmaId === mahatmaId
  );

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Member assignment not found' });
    return;
  }

  dbStore.teamMemberships.splice(index, 1);

  const team = dbStore.teams.find((t) => t.id === id);
  if (team) {
    team.memberCount = dbStore.teamMemberships.filter((tm) => tm.teamId === id && tm.active).length;
  }

  res.json({ success: true, message: 'Member removed from team' });
}
