import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.tsx';
import { ReceiptViewerModal } from '../components/common/ReceiptViewerModal.tsx';
import {
  Receipt,
  Plus,
  CheckCircle,
  XCircle,
  FileText,
  Search,
  Filter,
  Eye,
  CreditCard,
  Building,
  Calendar,
  AlertTriangle,
  History,
  Upload,
} from 'lucide-react';
import { Expense } from '../../shared/types/index.ts';

interface ExpensesPageProps {
  onNavigate: (path: string) => void;
  initialEventId?: string;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  onNavigate,
  initialEventId,
}) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    paidAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Categories & Events dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  // Create Expense Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Prasad & Kitchen');
  const [date, setDate] = useState('2026-09-20');
  const [paidBy, setPaidBy] = useState('');
  const [vendor, setVendor] = useState('');
  const [eventId, setEventId] = useState(initialEventId || '');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isAutoSubmit, setIsAutoSubmit] = useState(true);

  // View Receipt Modal
  const [receiptModal, setReceiptModal] = useState<{
    isOpen: boolean;
    url?: string;
    title: string;
    expenseId?: string;
  }>({
    isOpen: false,
    url: undefined,
    title: '',
  });

  // Rejection modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectExpenseId, setRejectExpenseId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // History modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [expenseHistory, setExpenseHistory] = useState<any[]>([]);
  const [historyTitle, setHistoryTitle] = useState('');

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

  const canApprove =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'CENTER_ADMIN' ||
    user?.role === 'FINANCE_ADMIN';

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (search.trim()) params.search = search;
      if (initialEventId) params.eventId = initialEventId;

      const res = await api.expenses.list(params);
      if (res.data) {
        setExpenses(res.data);
      }
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [statusFilter, categoryFilter, search, initialEventId]);

  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [catRes, evRes] = await Promise.all([
          api.settings.getExpenseCategories(),
          api.events.list({ limit: 100 }),
        ]);
        if (catRes.data) setCategories(catRes.data);
        if (evRes.data) setEvents(evRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadDropdowns();
  }, []);

  const handleOpenCreate = () => {
    setTitle('');
    setAmount('');
    setCategory('Prasad & Kitchen');
    setDate('2026-09-20');
    setPaidBy(user?.name || 'Mahatma Volunteer');
    setVendor('');
    setEventId(initialEventId || (events.length > 0 ? events[0].id : ''));
    setNotes('');
    setReceiptUrl('https://images.unsplash.com/photo-1554415707-9e4c019fcb47?auto=format&fit=crop&w=600&q=80');
    setIsAutoSubmit(true);
    setIsCreateModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        amount: Number(amount),
        category,
        date,
        paidBy,
        vendor,
        eventId: eventId || undefined,
        notes,
        receiptUrl,
        centerId: 'center-surat-01',
      };

      const res = await api.expenses.create(payload);
      if (res.data && isAutoSubmit) {
        await api.expenses.submit(res.data.id);
      }

      setIsCreateModalOpen(false);
      fetchExpenses();
    } catch (err) {
      console.error('Failed to create expense:', err);
    }
  };

  const handleSubmitExpense = async (id: string) => {
    try {
      await api.expenses.submit(id);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveExpense = (id: string, expTitle: string, amt: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Approve Expense Voucher',
      message: `Authorize payment approval for "${expTitle}" in the amount of ₹${amt.toLocaleString('en-IN')}?`,
      confirmLabel: 'Approve Expense',
      isDestructive: false,
      action: async () => {
        await api.expenses.approve(id);
        fetchExpenses();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleOpenReject = (id: string) => {
    setRejectExpenseId(id);
    setRejectionReason('Receipt details unclear. Please re-submit with vendor tax invoice.');
    setIsRejectModalOpen(true);
  };

  const handleRejectExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.expenses.reject(rejectExpenseId, rejectionReason);
      setIsRejectModalOpen(false);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkPaid = (id: string, expTitle: string, amt: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Mark Expense as Paid',
      message: `Confirm that ₹${amt.toLocaleString('en-IN')} for "${expTitle}" has been disbursed via cash/bank transfer?`,
      confirmLabel: 'Confirm Paid',
      isDestructive: false,
      action: async () => {
        await api.expenses.markPaid(id);
        fetchExpenses();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleViewHistory = async (exp: any) => {
    try {
      setHistoryTitle(exp.title);
      const res = await api.expenses.getHistory(exp.id);
      if (res.data) {
        setExpenseHistory(res.data);
        setIsHistoryModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Center Expenses & Vouchers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Transparent financial accounting, prasad receipts, logistics, and approval workflows
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Submit Expense Voucher
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Logged
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            ₹{summary.totalAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">All center vouchers</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
            Pending Approval
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            ₹{summary.pendingAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting committee review</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
            Approved For Payout
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-1">
            ₹{summary.approvedAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ready for disbursement</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
            Disbursed & Paid
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            ₹{summary.paidAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Settled center expenses</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { value: 'ALL', label: 'All Vouchers' },
            { value: 'SUBMITTED', label: 'Pending Approval' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'PAID', label: 'Paid' },
            { value: 'DRAFT', label: 'Drafts' },
            { value: 'REJECTED', label: 'Rejected' },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === s.value
                  ? 'bg-emerald-800 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses by title, paid by, vendor..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 outline-hidden"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <LoadingSpinner label="Loading expense vouchers..." />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expense vouchers found"
          description="There are no expense records matching your current filter criteria."
          actionLabel="Submit Expense"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description & Event</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Paid By & Vendor</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Receipt</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                      {exp.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{exp.title}</div>
                      {exp.eventName && (
                        <div
                          onClick={() => onNavigate(`/events/${exp.eventId}`)}
                          className="text-[11px] text-emerald-700 hover:underline cursor-pointer"
                        >
                          Event: {exp.eventName}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{exp.paidBy}</div>
                      {exp.vendor && (
                        <div className="text-[11px] text-slate-400">Vendor: {exp.vendor}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900 text-sm">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {exp.receiptUrl ? (
                        <button
                          onClick={() =>
                            setReceiptModal({
                              isOpen: true,
                              url: exp.receiptUrl,
                              title: exp.title,
                              expenseId: exp.id,
                            })
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Receipt
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">No voucher</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={exp.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* History audit */}
                        <button
                          onClick={() => handleViewHistory(exp)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title="Audit Trail"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        {/* Submit draft */}
                        {exp.status === 'DRAFT' && (
                          <button
                            onClick={() => handleSubmitExpense(exp.id)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded font-semibold text-[11px]"
                          >
                            Submit
                          </button>
                        )}

                        {/* Approval workflow buttons for Finance Admin */}
                        {canApprove && exp.status === 'SUBMITTED' && (
                          <>
                            <button
                              onClick={() => handleApproveExpense(exp.id, exp.title, exp.amount)}
                              className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold text-[11px] shadow-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenReject(exp.id)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-semibold text-[11px]"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Mark Paid button */}
                        {canApprove && exp.status === 'APPROVED' && (
                          <button
                            onClick={() => handleMarkPaid(exp.id, exp.title, exp.amount)}
                            className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded font-semibold text-[11px] shadow-xs flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            Mark Paid
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

      {/* Create Expense Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Submit Center Expense Voucher"
        subtitle="Record expenses for spiritual satsang, prasad, decoration, or venue rental"
      >
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expense Description *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mahaprasad Groceries & Ghee, Flower Garlands, Sound Cable Rental"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (INR ₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 4500"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Event (Optional)
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden bg-white"
              >
                <option value="">General Center Maintenance</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Paid By (Mahatma) *
              </label>
              <input
                type="text"
                required
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                placeholder="Volunteer name"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor / Merchant Name
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Surat Kirana Stores, Sound Provider"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Details</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Items purchased or justification..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="auto-submit"
              checked={isAutoSubmit}
              onChange={(e) => setIsAutoSubmit(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="auto-submit" className="text-xs text-slate-700 font-medium">
              Submit immediately for committee approval (skip draft state)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
            >
              Save Expense Voucher
            </button>
          </div>
        </form>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Expense Voucher"
        subtitle="Provide comments explaining why this expense is rejected"
      >
        <form onSubmit={handleRejectExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rejection Reason *
            </label>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>

      {/* History Audit Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Voucher Approval History"
        subtitle={historyTitle}
      >
        <div className="space-y-4">
          {expenseHistory.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No history recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {expenseHistory.map((item) => (
                <div key={item.id} className="py-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-slate-600">Performed by: {item.userName}</div>
                  {item.notes && (
                    <div className="text-slate-500 bg-slate-50 p-2 rounded text-[11px] mt-1">
                      {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Receipt Viewer & Upload Modal */}
      <ReceiptViewerModal
        isOpen={receiptModal.isOpen}
        onClose={() => setReceiptModal({ isOpen: false, url: undefined, title: '' })}
        receiptUrl={receiptModal.url}
        expenseTitle={receiptModal.title}
        canUpload={true}
        onReceiptUploaded={async (url) => {
          if (receiptModal.expenseId) {
            await api.expenses.update(receiptModal.expenseId, { receiptUrl: url });
            fetchExpenses();
          }
        }}
      />

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
