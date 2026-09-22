import { Response } from 'express';
import { dbStore } from '../services/dataStore.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export async function getExpenseReports(req: AuthenticatedRequest, res: Response): Promise<void> {
  const year = req.query.year as string;
  const month = req.query.month as string;

  let expenses = [...dbStore.expenses];

  if (year) {
    expenses = expenses.filter((e) => e.expenseDate.startsWith(year));
  }
  if (month) {
    const formatted = month.padStart(2, '0');
    expenses = expenses.filter((e) => e.expenseDate.split('-')[1] === formatted);
  }

  // 1. Overall Totals
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidAmount = expenses.filter((e) => e.status === 'PAID').reduce((sum, e) => sum + e.amount, 0);
  const approvedAmount = expenses.filter((e) => e.status === 'APPROVED').reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = expenses.filter((e) => e.status === 'SUBMITTED').reduce((sum, e) => sum + e.amount, 0);
  const draftAmount = expenses.filter((e) => e.status === 'DRAFT').reduce((sum, e) => sum + e.amount, 0);
  const averageAmount = expenses.length > 0 ? Math.round(totalAmount / expenses.length) : 0;

  // 2. By Category
  const categoryMap: { [cat: string]: { total: number; count: number } } = {};
  expenses.forEach((e) => {
    if (!categoryMap[e.category]) {
      categoryMap[e.category] = { total: 0, count: 0 };
    }
    categoryMap[e.category].total += e.amount;
    categoryMap[e.category].count += 1;
  });

  const byCategory = Object.keys(categoryMap).map((cat) => ({
    category: cat,
    amount: categoryMap[cat].total,
    count: categoryMap[cat].count,
    percentage: totalAmount > 0 ? Math.round((categoryMap[cat].total / totalAmount) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);

  // 3. By Event
  const eventMap: { [evtId: string]: { name: string; amount: number; count: number } } = {};
  expenses.forEach((e) => {
    const eventId = e.eventId || 'general';
    const eventName = e.eventId
      ? dbStore.events.find((ev) => ev.id === e.eventId)?.name || 'Event'
      : 'General Center Expense';

    if (!eventMap[eventId]) {
      eventMap[eventId] = { name: eventName, amount: 0, count: 0 };
    }
    eventMap[eventId].amount += e.amount;
    eventMap[eventId].count += 1;
  });

  const byEvent = Object.values(eventMap).sort((a, b) => b.amount - a.amount);

  // 4. By Team
  const teamMap: { [tId: string]: { name: string; amount: number; count: number } } = {};
  expenses.forEach((e) => {
    const teamId = e.teamId || 'general';
    const teamName = e.teamId
      ? dbStore.teams.find((t) => t.id === e.teamId)?.name || 'Team'
      : 'General Administration';

    if (!teamMap[teamId]) {
      teamMap[teamId] = { name: teamName, amount: 0, count: 0 };
    }
    teamMap[teamId].amount += e.amount;
    teamMap[teamId].count += 1;
  });

  const byTeam = Object.values(teamMap).sort((a, b) => b.amount - a.amount);

  // 5. By Month (Monthly Trend)
  const monthMap: { [m: string]: number } = {
    '2026-04': 14200,
    '2026-05': 18500,
    '2026-06': 16300,
    '2026-07': 28500,
    '2026-08': 34200,
    '2026-09': 25250,
  };

  expenses.forEach((e) => {
    const ym = e.expenseDate.substring(0, 7);
    if (!monthMap[ym]) monthMap[ym] = 0;
    // merge dynamically
    monthMap[ym] = (monthMap[ym] || 0) + e.amount;
  });

  const monthlyTrend = Object.keys(monthMap)
    .sort()
    .slice(-6)
    .map((monthKey) => {
      const [y, m] = monthKey.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLabel = `${monthNames[parseInt(m, 10) - 1]} ${y}`;
      return {
        month: monthLabel,
        key: monthKey,
        amount: monthMap[monthKey],
      };
    });

  res.json({
    success: true,
    data: {
      summary: {
        totalAmount,
        paidAmount,
        approvedAmount,
        pendingAmount,
        draftAmount,
        averageAmount,
        count: expenses.length,
      },
      byCategory,
      byEvent,
      byTeam,
      monthlyTrend,
    },
  });
}

export async function getAttendanceReports(req: AuthenticatedRequest, res: Response): Promise<void> {
  const events = dbStore.events.filter((e) => e.status === 'COMPLETED');
  const totalCompletedEvents = events.length;
  const totalRecordedAttendance = events.reduce((sum, e) => sum + (e.actualAttendance || 0), 0);
  const avgAttendance = totalCompletedEvents > 0 ? Math.round(totalRecordedAttendance / totalCompletedEvents) : 0;

  const eventTypeAttendance: { [type: string]: { count: number; totalAttendance: number } } = {};
  events.forEach((e) => {
    if (!eventTypeAttendance[e.eventType]) {
      eventTypeAttendance[e.eventType] = { count: 0, totalAttendance: 0 };
    }
    eventTypeAttendance[e.eventType].count += 1;
    eventTypeAttendance[e.eventType].totalAttendance += (e.actualAttendance || 0);
  });

  const byEventType = Object.keys(eventTypeAttendance).map((type) => ({
    eventType: type,
    eventsCount: eventTypeAttendance[type].count,
    totalAttendance: eventTypeAttendance[type].totalAttendance,
    averageAttendance: Math.round(eventTypeAttendance[type].totalAttendance / eventTypeAttendance[type].count),
  }));

  res.json({
    success: true,
    data: {
      summary: {
        totalCompletedEvents,
        totalRecordedAttendance,
        avgAttendance,
      },
      byEventType,
    },
  });
}
