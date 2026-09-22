import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import {
  UserCheck,
  UserPlus,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  Users,
  Sparkles,
} from 'lucide-react';
import { Mahatma } from '../../shared/types/index.ts';

interface MahatmasPageProps {
  onNavigate: (path: string) => void;
}

export const MahatmasPage: React.FC<MahatmasPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [mahatmas, setMahatmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mahatmaToEdit, setMahatmaToEdit] = useState<Mahatma | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Surat');
  const [skills, setSkills] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  const canManage =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'CENTER_ADMIN' ||
    user?.role === 'EVENT_COORDINATOR' ||
    user?.role === 'TEAM_COORDINATOR';

  const fetchMahatmas = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (search.trim()) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.mahatmas.list(params);
      if (res.data) {
        setMahatmas(res.data);
      }
    } catch (err) {
      console.error('Failed to load mahatmas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMahatmas();
  }, [search, statusFilter]);

  const handleOpenCreate = () => {
    setMahatmaToEdit(null);
    setFullName('');
    setPhone('');
    setEmail('');
    setArea('Adajan');
    setCity('Surat');
    setSkills('Seva, Welcome');
    setNotes('');
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: any) => {
    setMahatmaToEdit(m);
    setFullName(m.fullName);
    setPhone(m.phone);
    setEmail(m.email || '');
    setArea(m.area || '');
    setCity(m.city || 'Surat');
    setSkills(m.skills ? m.skills.join(', ') : '');
    setNotes(m.notes || '');
    setStatus(m.status || 'ACTIVE');
    setIsModalOpen(true);
  };

  const handleSaveMahatma = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        fullName,
        phone,
        email,
        area,
        city,
        skills: skillsArray,
        notes,
        status,
        centerId: 'center-surat-01',
      };

      if (mahatmaToEdit) {
        await api.mahatmas.update(mahatmaToEdit.id, payload);
      } else {
        await api.mahatmas.create(payload);
      }

      setIsModalOpen(false);
      fetchMahatmas();
    } catch (err) {
      console.error('Failed to save mahatma:', err);
    }
  };

  const handleDeleteMahatma = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Mahatma',
      message: `Are you sure you want to remove "${name}" from the center directory?`,
      action: async () => {
        await api.mahatmas.delete(id);
        fetchMahatmas();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Surat Mahatma Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Registered spiritual seekers, volunteers, seva teams, and contacts in Surat
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Mahatma
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, area, skills..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 outline-hidden"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Mahatmas</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Grid of Mahatmas */}
      {loading ? (
        <LoadingSpinner label="Loading directory..." />
      ) : mahatmas.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No mahatmas found"
          description="Try adjusting your search query or add a new mahatma to the directory."
          actionLabel={canManage ? 'Add Mahatma' : undefined}
          onAction={canManage ? handleOpenCreate : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mahatmas.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 font-bold text-sm flex items-center justify-center border border-emerald-200">
                      {m.fullName?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {m.fullName}
                      </h3>
                      <div className="text-[11px] text-slate-400">
                        {m.area ? `${m.area}, ${m.city}` : m.city}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={m.status} size="sm" />
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{m.phone}</span>
                  </div>
                  {m.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{m.email}</span>
                    </div>
                  )}
                  {m.area && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{m.area}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {m.skills && m.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {m.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Team assignments */}
                {m.teams && m.teams.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                    <span className="truncate">
                      Team: <span className="font-semibold text-slate-800">{m.teams.join(', ')}</span>
                    </span>
                  </div>
                )}
              </div>

              {canManage && (
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                    title="Edit Mahatma"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMahatma(m.id, m.fullName)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                    title="Delete Mahatma"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={mahatmaToEdit ? 'Edit Mahatma Details' : 'Add Mahatma to Directory'}
        subtitle="Register seeker or volunteer in Surat Center"
      >
        <form onSubmit={handleSaveMahatma} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name (with honorific) *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Harishbhai Shah, Minaben Patel"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98250 12345"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seeker@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Area / Neighborhood
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Adajan, Vesu, Pal, Varachha"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Skills & Seva Interests (comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Cooking, Sound, Welcome, Stage, Driving, First Aid"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden bg-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Availability preferences or seva experience..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
            >
              {mahatmaToEdit ? 'Save Changes' : 'Add Mahatma'}
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
        isDestructive={true}
      />
    </div>
  );
};
