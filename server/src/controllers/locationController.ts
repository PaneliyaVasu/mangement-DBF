import { Response } from 'express';
import { dbStore } from '../services/dataStore.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { locationSchema } from '../validators/index.ts';
import { Location } from '../../../shared/types/index.ts';

export async function getLocations(req: AuthenticatedRequest, res: Response): Promise<void> {
  const active = req.query.active !== 'false';
  const locations = dbStore.locations.filter((l) => (active ? l.active : true));

  const enriched = locations.map((loc) => {
    const upcomingEvents = dbStore.events.filter(
      (e) => e.locationId === loc.id && e.status !== 'COMPLETED' && e.status !== 'CANCELLED'
    );
    return {
      ...loc,
      upcomingEventsCount: upcomingEvents.length,
    };
  });

  res.json({ success: true, data: enriched });
}

export async function getLocationById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const location = dbStore.locations.find((l) => l.id === id);

  if (!location) {
    res.status(404).json({ success: false, message: 'Location not found', errorCode: 'LOCATION_NOT_FOUND' });
    return;
  }

  const upcomingEvents = dbStore.events
    .filter((e) => e.locationId === id && e.status !== 'COMPLETED' && e.status !== 'CANCELLED')
    .sort((a, b) => a.date.localeCompare(b.date));

  const pastEvents = dbStore.events
    .filter((e) => e.locationId === id && (e.status === 'COMPLETED' || e.status === 'CANCELLED'))
    .sort((a, b) => b.date.localeCompare(a.date));

  res.json({
    success: true,
    data: {
      ...location,
      upcomingEvents,
      pastEvents,
    },
  });
}

export async function createLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validated = locationSchema.parse(req.body);

    const newLoc: Location = {
      id: `loc-${Date.now()}`,
      centerId: validated.centerId || 'center-surat-01',
      name: validated.name,
      address: validated.address,
      city: validated.city || 'Surat',
      state: validated.state || 'Gujarat',
      postalCode: validated.postalCode,
      capacity: validated.capacity || 100,
      facilities: validated.facilities || [],
      contactName: validated.contactName,
      contactPhone: validated.contactPhone,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.locations.push(newLoc);

    dbStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: req.user?.userId || 'system',
      action: `Created location: ${newLoc.name}`,
      entityType: 'Location',
      entityId: newLoc.id,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: newLoc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors ? error.errors[0]?.message : error.message });
  }
}

export async function updateLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const location = dbStore.locations.find((l) => l.id === id);

  if (!location) {
    res.status(404).json({ success: false, message: 'Location not found' });
    return;
  }

  const { name, address, city, state, postalCode, capacity, facilities, contactName, contactPhone, active } = req.body;
  if (name) location.name = name;
  if (address) location.address = address;
  if (city) location.city = city;
  if (state) location.state = state;
  if (postalCode) location.postalCode = postalCode;
  if (capacity !== undefined) location.capacity = Number(capacity);
  if (facilities) location.facilities = facilities;
  if (contactName !== undefined) location.contactName = contactName;
  if (contactPhone !== undefined) location.contactPhone = contactPhone;
  if (active !== undefined) location.active = active;
  location.updatedAt = new Date().toISOString();

  res.json({ success: true, data: location });
}

export async function deleteLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const index = dbStore.locations.findIndex((l) => l.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Location not found' });
    return;
  }

  dbStore.locations.splice(index, 1);
  res.json({ success: true, message: 'Location deleted' });
}
