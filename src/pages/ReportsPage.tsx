import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Users,
  Calendar,
  Download,
  Filter,
} from 'lucide-react';

interface ReportsPageProps {
  onNavigate: (path: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const [expenseData, setExpenseData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState('2026');

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const [expRes, attRes] = await Promise.all([
          api.reports.getExpenses({ year }),
          api.reports.getAttendance(),
        ]);
        if (expRes.data) setExpenseData(expRes.data);
        if (attRes.data) setAttendanceData(attRes.data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [year]);

  if (loading) {
    return <LoadingSpinner label="Compiling Surat Center analytics..." />;
  }

  const categoryBreakdown = expenseData?.categoryBreakdown || [
    { name: 'Prasad & Kitchen', value: 12500 },
    { name: 'Decoration & Flowers', value: 4500 },
    { name: 'Sound & Audio Visual', value: 3800 },
    { name: 'Logistics & Seva', value: 2450 },
    { name: 'Handouts & Literature', value: 2000 },
  ];

  const monthlyTrend = expenseData?.monthlyTrend || [
    { month: 'Jan', amount: 18000 },
    { month: 'Feb', amount: 22000 },
    { month: 'Mar', amount: 19500 },
    { month: 'Apr', amount: 24000 },
    { month: 'May', amount: 21000 },
    { month: 'Jun', amount: 26000 },
    { month: 'Jul', amount: 23500 },
    { month: 'Aug', amount: 28000 },
    { month: 'Sep', amount: 25250 },
  ];

  const attendanceSummary = attendanceData?.attendanceByEvent || [
    { eventName: 'Guru Purnima Mahotsav', expected: 250, actual: 230 },
    { eventName: 'Janmashtami Celebrations', expected: 180, actual: 165 },
    { eventName: 'Youth Spiritual Shibir', expected: 120, actual: 110 },
    { eventName: 'Dada Bhagwan Satsang', expected: 186, actual: 180 },
    { eventName: 'Monthly Seva Coordination', expected: 45, actual: 42 },
  ];

  const COLORS = ['#047857', '#0d9488', '#0284c7', '#6366f1', '#e11d48', '#d97706'];

  const totalSpent = expenseData?.totalSpent || 25250;
  const avgAttendance = attendanceData?.averageAttendance || 174;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Financial & Attendance Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Surat Center analytical insights, category breakdown, and monthly attendance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 outline-hidden font-medium"
          >
            <option value="2026">Year 2026</option>
            <option value="2025">Year 2025</option>
          </select>
          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Expenses ({year})
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ₹{totalSpent.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Approved and paid vouchers</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg. Attendance per Event
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {avgAttendance} Mahatmas
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Average across gathering types</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Top Category
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">Prasad & Kitchen</div>
            <div className="text-[11px] text-slate-400 mt-0.5">49.5% of total budget</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts: 2-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expense Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monthly Expenditure Trend</h3>
            <p className="text-xs text-slate-500">Expenditure flow across months in INR (₹)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#047857"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Expenses by Category</h3>
            <p className="text-xs text-slate-500">Distribution across seva departments</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attendance Comparison Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Attendance: Expected vs Actual</h3>
          <p className="text-xs text-slate-500">
            Participation count across recent gatherings in Surat
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={attendanceSummary}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="eventName"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
              <Bar dataKey="expected" name="Expected Mahatmas" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual Attendance" fill="#047857" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
