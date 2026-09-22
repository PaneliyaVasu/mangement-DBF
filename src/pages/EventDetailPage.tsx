import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.tsx';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  UserCheck,
  Receipt,
  ArrowLeft,
  Plus,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Download,
  AlertCircle,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface EventDetailPageProps {
  eventId: string;
  onNavigate: (path: string) => void;
  onOpenCreateExpenseWithEvent?: (eventId: string) => void;
  onEditEvent?: (event: any) => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  eventId,
  onNavigate,
  onOpenCreateExpenseWithEvent,
  onEditEvent,
}) => {
  const { user } = useAuth();
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'teams' | 'attendance' | 'expenses'>('overview');

  // Modals state
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('18:30');
  const [scheduleEndTime, setScheduleEndTime] = useState('19:00');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [scheduleSpeaker, setScheduleSpeaker] = useState('');

  const [isAssignTeamOpen, setIsAssignTeamOpen] = useState(false);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamRoleDescription, setTeamRoleDescription] = useState('');

  // Attendance search/filter
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'REGISTERED'>('ALL');

  // Confirmation dialog
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

  const canMarkAttendance =
    canManage || user?.role === 'VOLUNTEER' || user?.role === 'TEAM_COORDINATOR';

  const loadEvent = async () => {
    try {
      setLoading(true);
      const res = await api.events.get(eventId);
      if (res.data) {
        setEventData(res.data);
      }
    } catch (err) {
      console.error('Failed to load event details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const handleStatusChange = async (action: 'publish' | 'cancel' | 'complete') => {
    try {
      if (action === 'publish') await api.events.publish(eventId);
      if (action === 'cancel') await api.events.cancel(eventId);
      if (action === 'complete') await api.events.complete(eventId);
      loadEvent();
    } catch (err) {
      console.error(`Failed to ${action} event:`, err);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.events.createSchedule(eventId, {
        title: scheduleTitle,
        startTime: scheduleStartTime,
        endTime: scheduleEndTime,
        description: scheduleDescription,
        speaker: scheduleSpeaker,
      });
      setIsAddScheduleOpen(false);
      setScheduleTitle('');
      setScheduleDescription('');
      setScheduleSpeaker('');
      loadEvent();
    } catch (err) {
      console.error('Failed to add schedule item:', err);
    }
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Schedule Segment',
      message: 'Are you sure you want to remove this segment from the event agenda?',
      confirmLabel: 'Remove',
      isDestructive: true,
      action: async () => {
        await api.events.deleteSchedule(eventId, scheduleId);
        loadEvent();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleOpenAssignTeam = async () => {
    try {
      const res = await api.teams.list();
      if (res.data) {
        setAllTeams(res.data);
        if (res.data.length > 0) setSelectedTeamId(res.data[0].id);
      }
      setIsAssignTeamOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.events.addTeam(eventId, {
        teamId: selectedTeamId,
        roleDescription: teamRoleDescription,
      });
      setIsAssignTeamOpen(false);
      setTeamRoleDescription('');
      loadEvent();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAttendance = async (
    mahatmaId: string,
    currentStatus: 'PRESENT' | 'ABSENT' | 'REGISTERED',
    newStatus: 'PRESENT' | 'ABSENT'
  ) => {
    try {
      await api.events.recordAttendance(eventId, {
        mahatmaId,
        status: currentStatus === newStatus ? 'REGISTERED' : newStatus,
      });
      loadEvent();
    } catch (err) {
      console.error('Failed to update attendance:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading event details..." />;
  }

  if (!eventData) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-2" />
        <h3 className="text-base font-bold text-slate-800">Event Not Found</h3>
        <button
          onClick={() => onNavigate('/events')}
          className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
        >
          Return to Events List
        </button>
      </div>
    );
  }

  const {
    event,
    location,
    coordinator,
    schedules = [],
    assignedTeams = [],
    attendance = [],
    expenses = [],
    totalExpenses = 0,
    attendanceRate = 0,
    presentCount = 0,
  } = eventData;

  const filteredAttendance = attendance.filter((item: any) => {
    const matchesFilter = attendanceFilter === 'ALL' || item.status === attendanceFilter;
    const matchesSearch =
      !attendanceSearch ||
      item.mahatma?.fullName?.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
      item.mahatma?.phone?.includes(attendanceSearch);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Back and Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button
          onClick={() => onNavigate('/events')}
          className="hover:text-slate-800 flex items-center gap-1 text-slate-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{event.name}</span>
      </div>

      {/* Main Event Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
                {event.eventType}
              </span>
              <StatusBadge status={event.status} size="md" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {event.name}
            </h1>

            {event.description && (
              <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
            )}

            {/* Event Key Meta Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <Calendar className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Date</div>
                  <div className="font-semibold text-slate-800">
                    {new Date(event.date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <Clock className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Time (IST)</div>
                  <div className="font-semibold text-slate-800">
                    {event.startTime} - {event.endTime}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Venue</div>
                  <div className="font-semibold text-slate-800 truncate">
                    {location?.name || 'Surat Main Center'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <User className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Coordinator</div>
                  <div className="font-semibold text-slate-800 truncate">
                    {coordinator?.name || 'Rajeshbhai Patel'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons (Publish, Complete, Cancel, Edit) */}
          {canManage && (
            <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
              {event.status === 'DRAFT' && (
                <button
                  onClick={() => handleStatusChange('publish')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Publish Event
                </button>
              )}

              {event.status === 'PUBLISHED' && (
                <button
                  onClick={() => handleStatusChange('complete')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Completed
                </button>
              )}

              {event.status !== 'CANCELLED' && event.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleStatusChange('cancel')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Event
                </button>
              )}

              {onEditEvent && (
                <button
                  onClick={() => onEditEvent(event)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>
          )}
        </div>

        {/* Instructions banner if available */}
        {event.instructions && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">Instructions for Mahatmas: </span>
              {event.instructions}
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'schedule', label: `Schedule (${schedules.length})` },
            { id: 'teams', label: `Seva Teams (${assignedTeams.length})` },
            { id: 'attendance', label: `Mahatmas & Attendance (${attendance.length})` },
            { id: 'expenses', label: `Expenses (₹${totalExpenses.toLocaleString('en-IN')})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-700 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Spiritual Program Summary</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {event.description ||
                  'Special satsang and spiritual gathering organized for all mahatmas and seekers in Surat Center.'}
              </p>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-1">Venue Information</h4>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p className="font-semibold text-slate-800">{location?.name}</p>
                    <p>{location?.address}</p>
                    <p>Maximum Capacity: {location?.capacity} persons</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-1">Center Coordination</h4>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p className="font-semibold text-slate-800">{coordinator?.name}</p>
                    <p>{coordinator?.email}</p>
                    <p>{coordinator?.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Agenda Preview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Agenda Timeline</h3>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Manage Agenda
                </button>
              </div>

              {schedules.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No schedule items added yet.</p>
              ) : (
                <div className="space-y-3">
                  {schedules.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="text-xs font-bold text-emerald-800 bg-white px-2 py-1 rounded border border-slate-200 whitespace-nowrap">
                        {item.startTime} - {item.endTime}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-900">{item.title}</div>
                        {item.speaker && (
                          <div className="text-[11px] text-slate-500 font-medium">
                            Speaker / Guide: {item.speaker}
                          </div>
                        )}
                        {item.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Attendance & Expense Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Attendance Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Expected Mahatmas</span>
                  <span className="font-bold text-slate-800">{event.expectedAttendance || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Registered Roster</span>
                  <span className="font-bold text-slate-800">{attendance.length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Confirmed Present</span>
                  <span className="font-bold text-emerald-700">{presentCount}</span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Attendance Rate</span>
                    <span>{attendanceRate}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, attendanceRate)}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('attendance')}
                  className="w-full mt-2 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
                >
                  Mark / View Attendance Roster
                </button>
              </div>
            </div>

            {/* Expense Summary Widget */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Event Financials</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Vouchers Logged</span>
                  <span className="font-bold text-slate-800">{expenses.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Approved / Spent</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{totalExpenses.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={() => setActiveTab('expenses')}
                  className="w-full mt-2 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  View Event Expenses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Schedule Timeline */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Event Agenda & Schedule</h3>
              <p className="text-xs text-slate-500">Chronological flow of spiritual activities</p>
            </div>
            {canManage && (
              <button
                onClick={() => setIsAddScheduleOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Agenda Item
              </button>
            )}
          </div>

          {schedules.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No schedule segments added yet. Click "Add Agenda Item" to structure the event.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {schedules.map((item: any, idx: number) => (
                <div key={item.id} className="py-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>
                      {item.speaker && (
                        <p className="text-xs text-emerald-800 font-medium mt-0.5">
                          Speaker / Guide: {item.speaker}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {canManage && (
                    <button
                      onClick={() => handleDeleteSchedule(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Remove segment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Assigned Seva Teams */}
      {activeTab === 'teams' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Assigned Seva Teams</h3>
              <p className="text-xs text-slate-500">
                Functional volunteer units deployed for this gathering
              </p>
            </div>
            {canManage && (
              <button
                onClick={handleOpenAssignTeam}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Assign Seva Team
              </button>
            )}
          </div>

          {assignedTeams.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No seva teams assigned yet. Click "Assign Seva Team" to allocate teams.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedTeams.map((assignment: any) => (
                <div
                  key={assignment.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{assignment.team?.name}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                      Assigned
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{assignment.roleDescription}</p>
                  <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-500 flex items-center justify-between">
                    <span>Primary Coordinator:</span>
                    <span className="font-semibold text-slate-800">
                      {assignment.team?.primaryCoordinatorName || 'Patel Coordinator'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Mahatmas & Attendance */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Mahatma Attendance Roster</h3>
              <p className="text-xs text-slate-500">
                Mark attendance in real-time as mahatmas arrive at Surat Center
              </p>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                placeholder="Search mahatma..."
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden"
              />
              <select
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 outline-hidden"
              >
                <option value="ALL">All Roster ({attendance.length})</option>
                <option value="PRESENT">Present ({presentCount})</option>
                <option value="REGISTERED">Pending</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>
          </div>

          {filteredAttendance.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No mahatmas found matching filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Mahatma Name</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">City / Area</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Attendance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendance.map((record: any) => (
                    <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {record.mahatma?.fullName}
                      </td>
                      <td className="py-2.5 px-3">{record.mahatma?.phone}</td>
                      <td className="py-2.5 px-3">{record.mahatma?.area || 'Surat'}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={record.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {canMarkAttendance ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                handleToggleAttendance(record.mahatmaId, record.status, 'PRESENT')
                              }
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                                record.status === 'PRESENT'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              Present
                            </button>
                            <button
                              onClick={() =>
                                handleToggleAttendance(record.mahatmaId, record.status, 'ABSENT')
                              }
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                                record.status === 'ABSENT'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <X className="w-3 h-3" />
                              Absent
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">View only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Event Expenses */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Expenses for this Event</h3>
              <p className="text-xs text-slate-500">
                Total Allocated: ₹{totalExpenses.toLocaleString('en-IN')}
              </p>
            </div>
            {onOpenCreateExpenseWithEvent && (
              <button
                onClick={() => onOpenCreateExpenseWithEvent(eventId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Event Expense
              </button>
            )}
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No expenses recorded for this event yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Title & Category</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Paid By / Vendor</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp: any) => (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{exp.title}</div>
                        <div className="text-[11px] text-slate-400">{exp.category}</div>
                      </td>
                      <td className="py-2.5 px-3">{exp.date}</td>
                      <td className="py-2.5 px-3">
                        <div>{exp.paidBy}</div>
                        {exp.vendor && <div className="text-[11px] text-slate-400">{exp.vendor}</div>}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={exp.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onNavigate(`/expenses/${exp.id}`)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                        >
                          View Voucher
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Schedule Modal */}
      <Modal
        isOpen={isAddScheduleOpen}
        onClose={() => setIsAddScheduleOpen(false)}
        title="Add Agenda Item"
        subtitle={`Schedule flow for ${event.name}`}
      >
        <form onSubmit={handleAddSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Session Title *</label>
            <input
              type="text"
              required
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value)}
              placeholder="e.g. Asim Kripa & Charan Vidhi, Audio Satsang"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={scheduleStartTime}
                onChange={(e) => setScheduleStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
              <input
                type="time"
                required
                value={scheduleEndTime}
                onChange={(e) => setScheduleEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Speaker / Guide</label>
            <input
              type="text"
              value={scheduleSpeaker}
              onChange={(e) => setScheduleSpeaker(e.target.value)}
              placeholder="e.g., Aptaputra Shri, Center Coordinator"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={scheduleDescription}
              onChange={(e) => setScheduleDescription(e.target.value)}
              placeholder="Details or guidelines for attendees..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddScheduleOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
            >
              Add to Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Team Modal */}
      <Modal
        isOpen={isAssignTeamOpen}
        onClose={() => setIsAssignTeamOpen(false)}
        title="Assign Seva Team to Event"
        subtitle={`Assign a volunteer seva unit to ${event.name}`}
      >
        <form onSubmit={handleAssignTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Team *</label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden bg-white"
            >
              {allTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Coord: {t.primaryCoordinatorName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role & Responsibility Description
            </label>
            <textarea
              rows={3}
              value={teamRoleDescription}
              onChange={(e) => setTeamRoleDescription(e.target.value)}
              placeholder="e.g. In charge of serving Mahaprasad to 200 mahatmas and cleanup afterwards."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAssignTeamOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
            >
              Assign Team
            </button>
          </div>
        </form>
      </Modal>

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
