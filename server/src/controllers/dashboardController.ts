import { Response } from 'express';
import { dbStore } from '../services/dataStore.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export async function getDashboardSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
  const nowStr = new Date().toISOString().substring(0, 10);
  const currentMonth = '2026-09'; // Default active month

  // Upcoming published events
  const upcomingEvents = dbStore.events
    .filter((e) => e.status !== 'COMPLETED' && e.status !== 'CANCELLED')
    .sort((a, b) => a.date.localeCompare(b.date));

  const nextEventRaw = upcomingEvents[0] || null;
  let nextEvent = null;

  if (nextEventRaw) {
    const loc = dbStore.locations.find((l) => l.id === nextEventRaw.locationId);
    const coord = dbStore.users.find((u) => u.id === nextEventRaw.primaryCoordinatorId);
    const teamAssignments = dbStore.eventTeamAssignments.filter((eta) => eta.eventId === nextEventRaw.id);
    const assignedTeams = teamAssignments.map((ta) => {
      const team = dbStore.teams.find((t) => t.id === ta.teamId);
      return team?.name || 'Team';
    });

    nextEvent = {
      ...nextEventRaw,
      locationName: loc?.name || 'Surat Main Center',
      locationAddress: loc?.address || '',
      coordinatorName: coord?.name || 'Coordinator',
      assignedTeams,
    };
  }

  // Monthly metrics
  const eventsThisMonth = dbStore.events.filter((e) => e.date.startsWith(currentMonth)).length;
  const activeTeams = dbStore.teams.filter((t) => t.active).length;
  const activeMahatmas = dbStore.mahatmas.filter((m) => m.status === 'ACTIVE').length;

  const expensesThisMonth = dbStore.expenses
    .filter((e) => e.expenseDate.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingExpenses = dbStore.expenses
    .filter((e) => e.status === 'SUBMITTED')
    .reduce((sum, e) => sum + e.amount, 0);

  const completedEvents = dbStore.events.filter((e) => e.status === 'COMPLETED');
  const attendanceRecorded = completedEvents.reduce(
    (sum, e) => sum + (e.actualAttendance || 0),
    0
  );

  // Enriched Upcoming list (next 4)
  const enrichedUpcoming = upcomingEvents.slice(0, 4).map((evt) => {
    const loc = dbStore.locations.find((l) => l.id === evt.locationId);
    const coord = dbStore.users.find((u) => u.id === evt.primaryCoordinatorId);
    return {
      ...evt,
      locationName: loc?.name || 'Surat Main Center',
      coordinatorName: coord?.name || 'Coordinator',
    };
  });

  // Recent Expenses
  const recentExpenses = [...dbStore.expenses]
    .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))
    .slice(0, 5)
    .map((exp) => {
      const event = dbStore.events.find((e) => e.id === exp.eventId);
      return {
        ...exp,
        eventName: event?.name || 'General',
      };
    });

  // Recent Activity / Audit Log
  const recentActivity = dbStore.auditLogs.slice(0, 6).map((log) => {
    const user = dbStore.users.find((u) => u.id === log.userId);
    return {
      ...log,
      userName: user?.name || 'System Admin',
    };
  });

  res.json({
    success: true,
    data: {
      nextEvent,
      stats: {
        upcomingEventsCount: upcomingEvents.length,
        eventsThisMonth,
        activeTeams,
        activeMahatmas,
        attendanceRecorded,
        expensesThisMonth,
        pendingExpenses,
      },
      upcomingEvents: enrichedUpcoming,
      recentExpenses,
      recentActivity,
    },
  });
}
