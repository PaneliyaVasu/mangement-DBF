import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import {
  Archive,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Receipt,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface ArchivesPageProps {
  onNavigate: (path: string) => void;
}

export const ArchivesPage: React.FC<ArchivesPageProps> = ({ onNavigate }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [search, setSearch] = useState('');

  const years = ['2026', '2025', '2024'];
  const months = [
    { value: 'ALL', label: 'All Months' },
    { value: '01', label: 'Jan' },
    { value: '02', label: 'Feb' },
    { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' },
    { value: '05', label: 'May' },
    { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' },
    { value: '08', label: 'Aug' },
    { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dec' },
  ];

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const res = await api.events.list({
        status: 'COMPLETED',
        year: selectedYear,
        month: selectedMonth !== 'ALL' ? selectedMonth : undefined,
        search: search.trim() || undefined,
        limit: 50,
      });
      if (res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Failed to load archives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, [selectedYear, selectedMonth, search]);

  const totalArchivedAttendance = events.reduce(
    (sum, evt) => sum + (evt.actualAttendance || evt.expectedAttendance || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Surat Center Event Archives
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Historical spiritual gatherings, attendance logs, and completed reports
          </p>
        </div>

        {/* Year Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {years.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedYear === yr
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {yr} Archives
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Strip for Selected Year */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Events
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{events.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Recorded in {selectedYear}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Archive className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Attendance
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {totalArchivedAttendance.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Mahatmas participated</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Center Locations Used
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">3 Venues</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Surat Main, Satsang & Community Halls</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Month Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {months.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMonth(m.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedMonth === m.value
                  ? 'bg-emerald-800 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="relative pt-2 border-t border-slate-100">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 mt-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${selectedYear} completed events by title, coordinator, location...`}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 outline-hidden"
          />
        </div>
      </div>

      {/* Archives Content */}
      {loading ? (
        <LoadingSpinner label={`Loading ${selectedYear} archives...`} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Archive}
          title={`No archived events found for ${selectedYear}`}
          description="Try changing the month filter or selecting a different year."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {evt.eventType}
                  </span>
                  <StatusBadge status={evt.status} size="sm" />
                </div>

                <div>
                  <h3
                    onClick={() => onNavigate(`/events/${evt.id}`)}
                    className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors line-clamp-1"
                  >
                    {evt.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(evt.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{evt.locationName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Coordinator: {evt.coordinatorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Attendance: {evt.actualAttendance || evt.expectedAttendance || 150} Mahatmas</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Archived Record</span>
                <button
                  onClick={() => onNavigate(`/events/${evt.id}`)}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                >
                  <span>Review Archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
