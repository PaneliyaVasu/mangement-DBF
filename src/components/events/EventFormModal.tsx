import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.tsx';
import { api } from '../../api/client.ts';
import { Event, Location, User, EventType } from '../../../shared/types/index.ts';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: Event | null;
  onSuccess: (event: Event) => void;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('Satsang');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('18:30');
  const [endTime, setEndTime] = useState('21:00');
  const [locationId, setLocationId] = useState('');
  const [primaryCoordinatorId, setPrimaryCoordinatorId] = useState('');
  const [expectedAttendance, setExpectedAttendance] = useState(150);
  const [instructions, setInstructions] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');

  const [locations, setLocations] = useState<Location[]>([]);
  const [coordinators, setCoordinators] = useState<User[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadFormDropdowns() {
      try {
        const [locRes, usersRes, typesRes] = await Promise.all([
          api.locations.list(),
          api.settings.getUsers(),
          api.settings.getEventTypes(),
        ]);
        if (locRes.data) {
          setLocations(locRes.data);
          if (!locationId && locRes.data.length > 0) setLocationId(locRes.data[0].id);
        }
        if (usersRes.data) {
          setCoordinators(usersRes.data);
          if (!primaryCoordinatorId && usersRes.data.length > 0) {
            setPrimaryCoordinatorId(usersRes.data[0].id);
          }
        }
        if (typesRes.data) {
          setEventTypes(typesRes.data);
        }
      } catch (err) {
        console.error('Failed to load form dropdowns:', err);
      }
    }
    if (isOpen) {
      loadFormDropdowns();
    }
  }, [isOpen]);

  useEffect(() => {
    if (eventToEdit) {
      setName(eventToEdit.name);
      setDescription(eventToEdit.description || '');
      setEventType(eventToEdit.eventType);
      setDate(eventToEdit.date);
      setStartTime(eventToEdit.startTime);
      setEndTime(eventToEdit.endTime);
      setLocationId(eventToEdit.locationId);
      setPrimaryCoordinatorId(eventToEdit.primaryCoordinatorId);
      setExpectedAttendance(eventToEdit.expectedAttendance || 150);
      setInstructions(eventToEdit.instructions || '');
      setBannerImageUrl(eventToEdit.bannerImageUrl || '');
      setStatus(eventToEdit.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED');
    } else {
      // Default to next Saturday
      const defaultDate = '2026-09-26';
      setName('');
      setDescription('');
      setEventType('Satsang');
      setDate(defaultDate);
      setStartTime('18:30');
      setEndTime('21:00');
      setExpectedAttendance(180);
      setInstructions('');
      setBannerImageUrl('https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=1200&q=80');
      setStatus('PUBLISHED');
    }
    setError(null);
  }, [eventToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (endTime <= startTime) {
      setError('End time must be later than start time.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        description,
        eventType,
        date,
        startTime,
        endTime,
        locationId,
        primaryCoordinatorId,
        expectedAttendance: Number(expectedAttendance),
        instructions,
        bannerImageUrl,
        status,
        centerId: 'center-surat-01',
      };

      let result;
      if (eventToEdit) {
        result = await api.events.update(eventToEdit.id, payload);
      } else {
        result = await api.events.create(payload);
      }

      if (result.data) {
        onSuccess(result.data);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventToEdit ? 'Edit Event Details' : 'Schedule New Event'}
      subtitle="Organize spiritual satsang, training, or center gathering in Surat"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* Event Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Event Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Dada Bhagwan Satsang, Gnan Vidhi Sabha"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden"
          />
        </div>

        {/* Event Type & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden bg-white"
            >
              {eventTypes.length > 0 ? (
                eventTypes.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="Satsang">Satsang</option>
                  <option value="Gnan Vidhi">Gnan Vidhi</option>
                  <option value="Spiritual Session">Spiritual Session</option>
                  <option value="Special Event">Special Event</option>
                  <option value="Festival">Festival</option>
                  <option value="Volunteer Meeting">Volunteer Meeting</option>
                  <option value="Training">Training</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden bg-white"
            />
          </div>
        </div>

        {/* Start Time & End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Time (IST) <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              End Time (IST) <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden bg-white"
            />
          </div>
        </div>

        {/* Location & Coordinator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Center Location <span className="text-rose-500">*</span>
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden bg-white"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} (Cap: {loc.capacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Coordinator <span className="text-rose-500">*</span>
            </label>
            <select
              value={primaryCoordinatorId}
              onChange={(e) => setPrimaryCoordinatorId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden bg-white"
            >
              {coordinators.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expected Attendance & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expected Attendance
            </label>
            <input
              type="number"
              min="0"
              value={expectedAttendance}
              onChange={(e) => setExpectedAttendance(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden bg-white"
            >
              <option value="PUBLISHED">Published (Visible to all)</option>
              <option value="DRAFT">Draft (Planning stage)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description & Spiritual Focus
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Overview of discourse topic, speaker details, or agenda..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden"
          />
        </div>

        {/* Instructions for Mahatmas */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Instructions for Attendees
          </label>
          <input
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g., Please arrive 15 minutes before satsang starts. Mahaprasad provided."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {eventToEdit ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
