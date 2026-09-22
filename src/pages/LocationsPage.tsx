import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.tsx';
import {
  MapPin,
  Plus,
  Users,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle,
  Building,
  Check,
} from 'lucide-react';
import { Location } from '../../shared/types/index.ts';

interface LocationsPageProps {
  onNavigate: (path: string) => void;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<Location | null>(null);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Surat');
  const [state, setState] = useState('Gujarat');
  const [capacity, setCapacity] = useState(250);
  const [facilities, setFacilities] = useState('');
  const [active, setActive] = useState(true);

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

  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'CENTER_ADMIN';

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await api.locations.list();
      if (res.data) {
        setLocations(res.data);
      }
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenCreate = () => {
    setLocationToEdit(null);
    setName('');
    setAddress('');
    setCity('Surat');
    setState('Gujarat');
    setCapacity(300);
    setFacilities('AC Satsang Hall, Stage & Sound, Prasad Kitchen, Parking Area');
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: Location) => {
    setLocationToEdit(loc);
    setName(loc.name);
    setAddress(loc.address);
    setCity(loc.city);
    setState(loc.state);
    setCapacity(loc.capacity);
    setFacilities(loc.facilities ? loc.facilities.join(', ') : '');
    setActive(loc.active);
    setIsModalOpen(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const facilitiesArray = facilities
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        name,
        address,
        city,
        state,
        capacity: Number(capacity),
        facilities: facilitiesArray,
        active,
        centerId: 'center-surat-01',
      };

      if (locationToEdit) {
        await api.locations.update(locationToEdit.id, payload);
      } else {
        await api.locations.create(payload);
      }

      setIsModalOpen(false);
      fetchLocations();
    } catch (err) {
      console.error('Failed to save location:', err);
    }
  };

  const handleDeleteLocation = (id: string, locName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Center Venue',
      message: `Are you sure you want to delete venue "${locName}"?`,
      action: async () => {
        await api.locations.delete(id);
        fetchLocations();
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
            Surat Center Venues & Locations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Physical gathering halls, prasad dining areas, and facilities in Surat, Gujarat
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Venue
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading venues..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center border border-purple-200">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{loc.name}</h3>
                      <div className="text-[11px] text-slate-400">
                        {loc.city}, {loc.state}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      loc.active
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {loc.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{loc.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span className="font-semibold text-slate-800">
                      Capacity: {loc.capacity} Mahatmas
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{loc.upcomingEventsCount || 0} Scheduled Events</span>
                  </div>
                </div>

                {/* Facilities List */}
                {loc.facilities && loc.facilities.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Facilities
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {loc.facilities.map((fac: string) => (
                        <span
                          key={fac}
                          className="text-[10px] bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {canManage && (
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(loc)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                    title="Edit Venue"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(loc.id, loc.name)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                    title="Delete Venue"
                  >
                    <Trash2 className="w-4 h-4" />
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
        title={locationToEdit ? 'Edit Center Venue' : 'Add New Center Venue'}
        subtitle="Manage halls and locations for Surat Center"
      >
        <form onSubmit={handleSaveLocation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Venue Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Surat Main Center, Surat Satsang Hall"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full street address in Surat"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity *</label>
              <input
                type="number"
                required
                min="10"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Facilities (comma separated)
            </label>
            <input
              type="text"
              value={facilities}
              onChange={(e) => setFacilities(e.target.value)}
              placeholder="e.g. AC Hall, Stage, Sound System, Commercial Kitchen, Parking"
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
              {locationToEdit ? 'Save Changes' : 'Create Venue'}
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
