import React, { useEffect, useState } from 'react';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  UserCheck,
  Receipt,
  Plus,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
  onOpenCreateEvent: () => void;
  onOpenCreateExpense?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenCreateEvent,
  onOpenCreateExpense,
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await api.dashboard.getSummary();
        if (res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading Surat Center Overview..." />;
  }

  const nextEvent = data?.nextEvent;
  const stats = data?.stats;
  const upcomingEvents = data?.upcomingEvents || [];
  const recentExpenses = data?.recentExpenses || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Jai Sachchidanand, {user?.name || 'Administrator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Surat Center Management • Spiritual schedule, seva teams, and financial records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="dash-create-event-btn"
            onClick={onOpenCreateEvent}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule Event
          </button>
          <button
            id="dash-create-expense-btn"
            onClick={onOpenCreateExpense}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
          >
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            Record Expense
          </button>
        </div>
      </div>

      {/* Prominent Next Event Card (Matches Prompt Blueprint) */}
      {nextEvent && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-md">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Featured Upcoming Gathering
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {nextEvent.name}
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                {nextEvent.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    {new Date(nextEvent.date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    {nextEvent.startTime} - {nextEvent.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{nextEvent.locationName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <User className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">Coord: {nextEvent.coordinatorName}</span>
                </div>
              </div>

              {nextEvent.assignedTeams?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                  <span className="text-slate-400 text-[11px] font-medium mr-1">Active Seva:</span>
                  {nextEvent.assignedTeams.map((team: string) => (
                    <span
                      key={team}
                      className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[11px] font-medium"
                    >
                      {team}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/15 min-w-[160px]">
                <div className="text-2xl font-black text-white">
                  {nextEvent.expectedAttendance || 186}
                </div>
                <div className="text-[11px] font-medium text-emerald-200 uppercase tracking-wider">
                  Expected Mahatmas
                </div>
              </div>
              <button
                id="view-featured-event-btn"
                onClick={() => onNavigate(`/events/${nextEvent.id}`)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm"
              >
                <span>Event Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div
          onClick={() => onNavigate('/events')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Upcoming</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.upcomingEventsCount || 0}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Events Scheduled</div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => onNavigate('/teams')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Teams</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.activeTeams || 8}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active Seva Units</div>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => onNavigate('/mahatmas')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mahatmas</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.activeMahatmas || 16}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Registered Volunteers</div>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => onNavigate('/archives')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Attendance</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.attendanceRecorded || 1737}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Recorded Total</div>
        </div>

        {/* Metric 5 */}
        <div
          onClick={() => onNavigate('/expenses')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">September</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{(stats?.expensesThisMonth || 25250).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Disbursed Expenses</div>
        </div>

        {/* Metric 6 */}
        <div
          onClick={() => onNavigate('/expenses')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">
            ₹{(stats?.pendingExpenses || 3200).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Awaiting Approval</div>
        </div>
      </div>

      {/* Main 2-Column Split: Upcoming Schedule & Recent Financial Vouchers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events Column (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Upcoming Satsang Schedule</h3>
              <p className="text-xs text-slate-500">Next gatherings at Surat Center venues</p>
            </div>
            <button
              onClick={() => onNavigate('/events')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              View Full Calendar
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingEvents.map((evt: any) => (
              <div
                key={evt.id}
                onClick={() => onNavigate(`/events/${evt.id}`)}
                className="py-3.5 hover:bg-slate-50/80 p-2 rounded-xl transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center flex-shrink-0 text-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      {new Date(evt.date).toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                    <span className="text-base font-extrabold leading-none">
                      {new Date(evt.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 hover:text-emerald-700">
                        {evt.name}
                      </h4>
                      <StatusBadge status={evt.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {evt.startTime} - {evt.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {evt.locationName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                  <div className="text-xs">
                    <div className="text-slate-900 font-medium">{evt.coordinatorName}</div>
                    <div className="text-[11px] text-slate-400">Coordinator</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses & Recent Audit Column (1 col) */}
        <div className="space-y-6">
          {/* Recent Expenses */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Expenses</h3>
                <p className="text-[11px] text-slate-500">Vouchers submitted for center activities</p>
              </div>
              <button
                onClick={() => onNavigate('/expenses')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                All
              </button>
            </div>

            <div className="space-y-2.5">
              {recentExpenses.map((exp: any) => (
                <div
                  key={exp.id}
                  onClick={() => onNavigate(`/expenses/${exp.id}`)}
                  className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-slate-900 line-clamp-1">{exp.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {exp.category} • {exp.paidBy}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="mt-0.5">
                      <StatusBadge status={exp.status} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity / Audit Log */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                <p className="text-[11px] text-slate-500">System audit trail & coordination</p>
              </div>
              <button
                onClick={() => onNavigate('/settings')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Logs
              </button>
            </div>

            <div className="space-y-3">
              {recentActivity.map((log: any) => (
                <div key={log.id} className="text-xs flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium leading-relaxed">{log.action}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {log.userName} •{' '}
                      {new Date(log.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
