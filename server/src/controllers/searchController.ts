import { Response } from 'express';
import { dbStore } from '../services/dataStore.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export async function globalSearch(req: AuthenticatedRequest, res: Response): Promise<void> {
  const query = (req.query.q as string)?.trim().toLowerCase();

  if (!query || query.length < 2) {
    res.json({
      success: true,
      data: {
        events: [],
        teams: [],
        mahatmas: [],
        locations: [],
        expenses: [],
      },
    });
    return;
  }

  const events = dbStore.events
    .filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.eventType.toLowerCase().includes(query)
    )
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      title: e.name,
      subtitle: `${e.date} • ${e.eventType}`,
      type: 'event',
      link: `/events/${e.id}`,
    }));

  const teams = dbStore.teams
    .filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
    )
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      title: t.name,
      subtitle: `${t.memberCount} members`,
      type: 'team',
      link: `/teams/${t.id}`,
    }));

  const mahatmas = dbStore.mahatmas
    .filter(
      (m) =>
        m.displayName.toLowerCase().includes(query) ||
        m.phone.includes(query) ||
        (m.email && m.email.toLowerCase().includes(query))
    )
    .slice(0, 5)
    .map((m) => ({
      id: m.id,
      title: m.displayName,
      subtitle: m.phone,
      type: 'mahatma',
      link: `/mahatmas/${m.id}`,
    }));

  const locations = dbStore.locations
    .filter(
      (l) =>
        l.name.toLowerCase().includes(query) ||
        l.address.toLowerCase().includes(query) ||
        l.city.toLowerCase().includes(query)
    )
    .slice(0, 5)
    .map((l) => ({
      id: l.id,
      title: l.name,
      subtitle: `${l.address}, ${l.city} (Cap: ${l.capacity})`,
      type: 'location',
      link: `/locations/${l.id}`,
    }));

  const expenses = dbStore.expenses
    .filter(
      (exp) =>
        exp.title.toLowerCase().includes(query) ||
        exp.paidBy.toLowerCase().includes(query) ||
        exp.category.toLowerCase().includes(query)
    )
    .slice(0, 5)
    .map((exp) => ({
      id: exp.id,
      title: exp.title,
      subtitle: `₹${exp.amount.toLocaleString('en-IN')} • ${exp.status}`,
      type: 'expense',
      link: `/expenses/${exp.id}`,
    }));

  res.json({
    success: true,
    data: {
      events,
      teams,
      mahatmas,
      locations,
      expenses,
      totalCount: events.length + teams.length + mahatmas.length + locations.length + expenses.length,
    },
  });
}
