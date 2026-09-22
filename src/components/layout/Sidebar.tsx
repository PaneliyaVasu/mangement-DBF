import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Archive,
  Users,
  UserCheck,
  Receipt,
  MapPin,
  BarChart3,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Events', path: '/events', icon: Calendar },
    { label: 'Archives', path: '/archives', icon: Archive },
    { label: 'Teams', path: '/teams', icon: Users },
    { label: 'Mahatmas', path: '/mahatmas', icon: UserCheck },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Locations', path: '/locations', icon: MapPin },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex-shrink-0">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));

          return (
            <button
              key={item.path}
              id={`nav-${item.label.toLowerCase()}`}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/60 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Surat Center Footer Info */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
          <div className="text-xs font-semibold text-slate-800">Surat Center</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Adajan & Vesu, Surat</div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>IST (UTC+5:30)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          </div>
        </div>
      </div>
    </aside>
  );
};
