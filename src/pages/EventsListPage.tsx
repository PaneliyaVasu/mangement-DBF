import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Event } from '../../shared/types/index.ts';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.tsx';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Plus,
  Search,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface EventsListPageProps {
  onNavigate: (path: string) => void;
  onOpenCreateEvent: () => void;
  onEditEvent?: (event: Event) => void;
}

export const EventsListPage: React.FC<EventsListPageProps> = ({
  onNavigate,
  onOpenCreateEvent,
  onEditEvent,
}) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Confirmation dialogs state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isDestructive: boolean;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    isDestructive: false,
    action: async () => {},
  });

  const canManage =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'CENTER_ADMIN' ||
    user?.role === 'EVENT_COORDINATOR';

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.eventType = typeFilter;
      if (search.trim()) params.search = search;

      const res = await api.events.list(params);
      if (res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, typeFilter, search]);

  const handleDeleteEvent = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Event',
      message: `Are you sure you want to permanently delete "${name}"? This action will remove all linked schedules and assignments.`,
      confirmLabel: 'Delete Event',
      isDestructive: true,
      action: async () => {
        await api.events.delete(id);
        fetchEvents();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handlePublishEvent = async (id: string) => {
    try {
      await api.events.publish(id);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteEvent = async (id: string) => {
    try {
      await api.events.complete(id);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelEvent = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Event',
      message: `Are you sure you want to mark "${name}" as Cancelled? Volunteers will be notified.`,
      confirmLabel: 'Cancel Event',
      isDestructive: true,
      action: async () => {
        await api.events.cancel(id);
        fetchEvents();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const statuses = [
    { value: 'ALL', label: 'All Events' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ONGOING', label: 'Ongoing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'DRAFT', label: 'Drafts' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Satsang & Center Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Surat Center schedule, seva assignments, and attendance logs
          </p>
        </div>

        {canManage && (
          <button
            id="events-schedule-new-btn"
            onClick={onOpenCreateEvent}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule New Event
          </button>
        )}
      </div>

      {/* Filter and View Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === s.value
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event title, location, coordinator..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Event Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 outline-hidden"
            >
              <option value="ALL">All Event Types</option>
              <option value="Satsang">Satsang</option>
              <option value="Gnan Vidhi">Gnan Vidhi</option>
              <option value="Spiritual Session">Spiritual Session</option>
              <option value="Volunteer Meeting">Volunteer Meeting</option>
              <option value="Festival">Festival</option>
              <option value="Special Event">Special Event</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Events Content */}
      {loading ? (
        <LoadingSpinner label="Loading events..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="There are currently no events matching the selected filters. Schedule a new event or adjust the filter criteria."
          actionLabel={canManage ? 'Schedule New Event' : undefined}
          onAction={canManage ? onOpenCreateEvent : undefined}
        />
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col overflow-hidden group"
            >
              {/* Card Header & Date Badge */}
              <div className="p-5 flex-1 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {evt.eventType}
                    </span>
                    <StatusBadge status={evt.status} />
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-800">
                      {new Date(evt.date).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {new Date(evt.date).getFullYear()}
                    </div>
                  </div>
                </div>

                <div>
                  <h3
                    onClick={() => onNavigate(`/events/${evt.id}`)}
                    className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-1"
                  >
                    {evt.name}
                  </h3>
                  {evt.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  )}
                </div>

                {/* Details list */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>
                      {evt.startTime} - {evt.endTime} (IST)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{evt.locationName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">Coord: {evt.coordinatorName}</span>
                  </div>
                  {evt.expectedAttendance && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Exp: {evt.expectedAttendance} Mahatmas</span>
                    </div>
                  )}
                </div>

                {/* Assigned Teams */}
                {evt.assignedTeams?.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1">
                    {evt.assignedTeams.map((teamName: string) => (
                      <span
                        key={teamName}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                      >
                        {teamName}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onNavigate(`/events/${evt.id}`)}
                  className="font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Details
                </button>

                {canManage && (
                  <div className="flex items-center gap-1.5">
                    {evt.status === 'DRAFT' && (
                      <button
                        onClick={() => handlePublishEvent(evt.id)}
                        className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded"
                        title="Publish Event"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {evt.status === 'PUBLISHED' && (
                      <button
                        onClick={() => handleCompleteEvent(evt.id)}
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded"
                        title="Mark Completed"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {evt.status !== 'CANCELLED' && evt.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleCancelEvent(evt.id, evt.name)}
                        className="p-1.5 text-amber-700 hover:bg-amber-50 rounded"
                        title="Cancel Event"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    {onEditEvent && (
                      <button
                        onClick={() => onEditEvent(evt)}
                        className="p-1.5 text-slate-600 hover:bg-slate-200/60 rounded"
                        title="Edit Event"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteEvent(evt.id, evt.name)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Event Name & Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Coordinator</th>
                  <th className="py-3 px-4">Expected</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        {new Date(evt.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {evt.startTime} - {evt.endTime}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div
                        onClick={() => onNavigate(`/events/${evt.id}`)}
                        className="font-semibold text-slate-900 hover:text-emerald-700 cursor-pointer"
                      >
                        {evt.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{evt.eventType}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{evt.locationName}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{evt.coordinatorName}</td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700">
                      {evt.expectedAttendance || '-'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={evt.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate(`/events/${evt.id}`)}
                          className="px-2 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium text-[11px]"
                        >
                          View
                        </button>
                        {canManage && onEditEvent && (
                          <button
                            onClick={() => onEditEvent(evt)}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={() => handleDeleteEvent(evt.id, evt.name)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};
