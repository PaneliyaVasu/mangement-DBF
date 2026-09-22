import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import {
  Settings,
  Building,
  Shield,
  Tag,
  Receipt,
  History,
  Plus,
  Save,
  CheckCircle,
  Users,
  Lock,
} from 'lucide-react';
import { UserRole } from '../../shared/types/index.ts';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'center' | 'eventTypes' | 'expenseCats' | 'users' | 'audit'>('center');
  const [loading, setLoading] = useState(true);

  // Center Info State
  const [centerName, setCenterName] = useState('Surat Center');
  const [city, setCity] = useState('Surat');
  const [state, setState] = useState('Gujarat');
  const [country, setCountry] = useState('India');
  const [email, setEmail] = useState('contact@suratcenter.org');
  const [phone, setPhone] = useState('+91 261 278 1234');
  const [address, setAddress] = useState('Adajan & Vesu, Surat, Gujarat, India');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Event Types
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');

  // Expense Categories
  const [expenseCats, setExpenseCats] = useState<any[]>([]);
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Users & RBAC
  const [usersList, setUsersList] = useState<any[]>([]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      const [cRes, etRes, ecRes, uRes, aRes] = await Promise.all([
        api.settings.getCenter(),
        api.settings.getEventTypes(),
        api.settings.getExpenseCategories(),
        api.settings.getUsers(),
        api.settings.getAuditLogs({ limit: 50 }),
      ]);

      if (cRes.data) {
        setCenterName(cRes.data.name);
        setCity(cRes.data.city);
        setState(cRes.data.state);
        setCountry(cRes.data.country);
        setEmail(cRes.data.email || '');
        setPhone(cRes.data.phone || '');
        setAddress(cRes.data.address || '');
      }

      if (etRes.data) setEventTypes(etRes.data);
      if (ecRes.data) setExpenseCats(ecRes.data);
      if (uRes.data) setUsersList(uRes.data);
      if (aRes.data) setAuditLogs(aRes.data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleSaveCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.settings.updateCenter({
        name: centerName,
        city,
        state,
        country,
        email,
        phone,
        address,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update center:', err);
    }
  };

  const handleAddEventType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.settings.createEventType({
        name: newTypeName,
        description: newTypeDesc,
        centerId: 'center-surat-01',
      });
      setIsAddTypeModalOpen(false);
      setNewTypeName('');
      setNewTypeDesc('');
      loadSettingsData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExpenseCat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.settings.createExpenseCategory({
        name: newCatName,
        description: newCatDesc,
        centerId: 'center-surat-01',
      });
      setIsAddCatModalOpen(false);
      setNewCatName('');
      setNewCatDesc('');
      loadSettingsData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      await api.settings.updateUserRole(userId, { role: newRole });
      loadSettingsData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading settings..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Center Settings & Administration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure Surat Center details, user privileges (RBAC), categories, and system audit logs
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto">
          {[
            { id: 'center', label: 'Center Profile', icon: Building },
            { id: 'eventTypes', label: 'Event Types', icon: Tag },
            { id: 'expenseCats', label: 'Expense Categories', icon: Receipt },
            { id: 'users', label: 'Users & Roles (RBAC)', icon: Shield },
            { id: 'audit', label: 'Audit Trail', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 text-xs font-semibold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'border-emerald-700 text-emerald-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab 1: Center Profile */}
      {activeTab === 'center' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-slate-900">Center Information</h3>
            <p className="text-xs text-slate-500">Official center identity, address, and contacts</p>
          </div>

          <form onSubmit={handleSaveCenter} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Center Name *
              </label>
              <input
                type="text"
                required
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Helpline Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Headquarters Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
              />
            </div>

            <div className="pt-3 border-t flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Center settings updated successfully!
                </span>
              ) : <div />}

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Event Types */}
      {activeTab === 'eventTypes' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Event Types</h3>
              <p className="text-xs text-slate-500">Categories used to organize center gatherings</p>
            </div>
            <button
              onClick={() => setIsAddTypeModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Event Type
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {eventTypes.map((t) => (
              <div key={t.id} className="py-3 flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">{t.name}</span>
                  {t.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                  )}
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Expense Categories */}
      {activeTab === 'expenseCats' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Expense Categories</h3>
              <p className="text-xs text-slate-500">Ledger accounting buckets for center costs</p>
            </div>
            <button
              onClick={() => setIsAddCatModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Category
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {expenseCats.map((c) => (
              <div key={c.id} className="py-3 flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">{c.name}</span>
                  {c.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>
                  )}
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Users & RBAC */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">User Accounts & Access Control</h3>
              <p className="text-xs text-slate-500">
                Role-based privileges: Super Admin, Center Admin, Finance Admin, Event Coordinator, Volunteer
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Assigned Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-3 px-3">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-700 font-medium text-[11px]">Active</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isSuperAdmin ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value as UserRole)}
                          className="px-2 py-1 text-xs bg-white border border-slate-200 rounded text-slate-700 outline-hidden font-medium"
                        >
                          <option value="SUPER_ADMIN">Super Admin</option>
                          <option value="CENTER_ADMIN">Center Admin</option>
                          <option value="FINANCE_ADMIN">Finance Admin</option>
                          <option value="EVENT_COORDINATOR">Event Coordinator</option>
                          <option value="TEAM_COORDINATOR">Team Coordinator</option>
                          <option value="VOLUNTEER">Volunteer</option>
                        </select>
                      ) : (
                        <span className="text-[11px] text-slate-400">Restricted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: System Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">System Activity & Audit Log</h3>
            <p className="text-xs text-slate-500">Security audit trail of platform events</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Entity Type</th>
                  <th className="py-3 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{log.userName}</td>
                    <td className="py-2.5 px-3 font-medium text-emerald-800">{log.action}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Event Type Modal */}
      <Modal
        isOpen={isAddTypeModalOpen}
        onClose={() => setIsAddTypeModalOpen(false)}
        title="Add New Event Type"
        subtitle="Organize gathering formats for Surat Center"
      >
        <form onSubmit={handleAddEventType} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Type Name *</label>
            <input
              type="text"
              required
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="e.g., Youth Shibir, Gyan Seminar"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={newTypeDesc}
              onChange={(e) => setNewTypeDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddTypeModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
            >
              Add Type
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Expense Category Modal */}
      <Modal
        isOpen={isAddCatModalOpen}
        onClose={() => setIsAddCatModalOpen(false)}
        title="Add New Expense Category"
        subtitle="Configure expenditure department for financial accounting"
      >
        <form onSubmit={handleAddExpenseCat} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g., Audio Video Batteries, Literature Printing"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddCatModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
            >
              Add Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
