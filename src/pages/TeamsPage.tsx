import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.tsx';
import {
  Users,
  UserPlus,
  Plus,
  User,
  Trash2,
  Edit2,
  CheckCircle,
  Search,
  ChevronRight,
  Shield,
  Phone,
} from 'lucide-react';

interface TeamsPageProps {
  onNavigate: (path: string) => void;
}

export const TeamsPage: React.FC<TeamsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected team for member roster drawer/modal
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Create/Edit Team Modal
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<any | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [primaryCoordinatorId, setPrimaryCoordinatorId] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Add Member Modal
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [allMahatmas, setAllMahatmas] = useState<any[]>([]);
  const [selectedMahatmaId, setSelectedMahatmaId] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');

  // Confirm delete dialog
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
    user?.role === 'EVENT_COORDINATOR';

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await api.teams.list({ search: search.trim() || undefined });
      if (res.data) {
        setTeams(res.data);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [search]);

  useEffect(() => {
    async function loadCoordinators() {
      try {
        const res = await api.settings.getUsers();
        if (res.data) {
          setAllUsers(res.data);
          if (res.data.length > 0) setPrimaryCoordinatorId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCoordinators();
  }, []);

  const openTeamMembers = async (team: any) => {
    setSelectedTeam(team);
    setLoadingMembers(true);
    try {
      const res = await api.teams.get(team.id);
      if (res.data) {
        setTeamMembers(res.data.members || []);
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleOpenCreateTeam = () => {
    setTeamToEdit(null);
    setTeamName('');
    setTeamDescription('');
    if (allUsers.length > 0) setPrimaryCoordinatorId(allUsers[0].id);
    setIsTeamModalOpen(true);
  };

  const handleOpenEditTeam = (team: any) => {
    setTeamToEdit(team);
    setTeamName(team.name);
    setTeamDescription(team.description || '');
    setPrimaryCoordinatorId(team.primaryCoordinatorId);
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: teamName,
        description: teamDescription,
        primaryCoordinatorId,
        centerId: 'center-surat-01',
        active: true,
      };

      if (teamToEdit) {
        await api.teams.update(teamToEdit.id, payload);
      } else {
        await api.teams.create(payload);
      }
      setIsTeamModalOpen(false);
      fetchTeams();
    } catch (err) {
      console.error('Failed to save team:', err);
    }
  };

  const handleDeleteTeam = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Team',
      message: `Are you sure you want to delete "${name}"?`,
      action: async () => {
        await api.teams.delete(id);
        fetchTeams();
        if (selectedTeam?.id === id) setSelectedTeam(null);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleOpenAddMember = async () => {
    try {
      const res = await api.mahatmas.list({ limit: 100 });
      if (res.data) {
        // Filter out already members
        const currentMemberIds = new Set(teamMembers.map((m) => m.mahatmaId));
        const available = res.data.filter((m) => !currentMemberIds.has(m.id));
        setAllMahatmas(available);
        if (available.length > 0) setSelectedMahatmaId(available[0].id);
      }
      setIsAddMemberModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !selectedMahatmaId) return;

    try {
      await api.teams.addMember(selectedTeam.id, {
        mahatmaId: selectedMahatmaId,
        role: memberRole,
      });
      setIsAddMemberModalOpen(false);
      openTeamMembers(selectedTeam);
      fetchTeams();
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const handleRemoveMember = async (mahatmaId: string) => {
    if (!selectedTeam) return;
    try {
      await api.teams.removeMember(selectedTeam.id, mahatmaId);
      openTeamMembers(selectedTeam);
      fetchTeams();
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
            Surat Center Seva Teams
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organized volunteer seva units for gatherings, prasad, logistics, and audio-video
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreateTeam}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Seva Team
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams by name or seva description..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 outline-hidden"
          />
        </div>
      </div>

      {/* Main Grid: Teams List & Selected Team Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <LoadingSpinner label="Loading seva teams..." />
          ) : teams.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No teams found"
              description="No seva teams match your criteria."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teams.map((team) => {
                const isSelected = selectedTeam?.id === team.id;

                return (
                  <div
                    key={team.id}
                    className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                    }`}
                    onClick={() => openTeamMembers(team)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                          {team.name}
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {team.memberCount || 0} Members
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {team.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                        <span className="truncate">
                          Lead: <span className="font-semibold">{team.primaryCoordinatorName}</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <span>View Volunteers</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>

                      {canManage && (
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleOpenEditTeam(team)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                            title="Edit Team"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(team.id, team.name)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                            title="Delete Team"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Team Members Roster Drawer/Panel (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          {selectedTeam ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedTeam.name}</h3>
                  <p className="text-xs text-slate-500">
                    Lead: {selectedTeam.primaryCoordinatorName}
                  </p>
                </div>
                {canManage && (
                  <button
                    onClick={handleOpenAddMember}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Add Member
                  </button>
                )}
              </div>

              {loadingMembers ? (
                <LoadingSpinner label="Loading members..." />
              ) : teamMembers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No volunteers currently assigned to this seva unit.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {teamMembers.map((m) => (
                    <div
                      key={m.id}
                      className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-lg"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {m.mahatma?.fullName}
                          {m.role === 'LEAD' && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded font-bold">
                              LEAD
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {m.mahatma?.phone}
                          </span>
                          <span>•</span>
                          <span>{m.mahatma?.area || 'Surat'}</span>
                        </div>
                      </div>

                      {canManage && (
                        <button
                          onClick={() => handleRemoveMember(m.mahatmaId)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Remove from team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Select any seva team on the left to view assigned volunteers and team roster.
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Team Modal */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title={teamToEdit ? 'Edit Seva Team' : 'Create New Seva Team'}
        subtitle="Manage volunteer seva units for Surat Center"
      >
        <form onSubmit={handleSaveTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Team Name *</label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Welcome & Seva Team, Sound & AV Team"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Coordinator *
            </label>
            <select
              value={primaryCoordinatorId}
              onChange={(e) => setPrimaryCoordinatorId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden bg-white"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Responsibilities
            </label>
            <textarea
              rows={3}
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              placeholder="Scope of seva, duties during satsang, required equipment..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
            >
              {teamToEdit ? 'Save Changes' : 'Create Team'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Add Volunteer to Team"
        subtitle={`Select a Mahatma from directory for ${selectedTeam?.name}`}
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Mahatma *
            </label>
            <select
              value={selectedMahatmaId}
              onChange={(e) => setSelectedMahatmaId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden bg-white"
            >
              {allMahatmas.length === 0 ? (
                <option value="">No available mahatmas found</option>
              ) : (
                allMahatmas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.phone}) - {m.area || 'Surat'}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Team Role</label>
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden bg-white"
            >
              <option value="MEMBER">Member / Volunteer</option>
              <option value="LEAD">Sub-Team Lead</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddMemberModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={allMahatmas.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs disabled:opacity-50"
            >
              Add Member
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
