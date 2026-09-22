import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import {
  Search,
  Bell,
  CheckCircle2,
  Calendar,
  Users,
  UserCheck,
  Receipt,
  MapPin,
  ChevronDown,
  Shield,
  LogOut,
  Building,
} from 'lucide-react';
import { UserRole } from '../../../shared/types/index.ts';

interface NavbarProps {
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { user, logout, switchRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifs() {
      try {
        const res = await api.notifications.list();
        if (res.data) {
          setNotifications(res.data);
          setUnreadCount(res.unreadCount);
        }
      } catch (err) {
        // quiet error
      }
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Global debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.search.global(searchQuery);
        if (res.data) {
          setSearchResults(res.data);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full platform access & role management' },
    { role: 'CENTER_ADMIN', label: 'Center Admin', desc: 'Center operations, events & approvals' },
    { role: 'FINANCE_ADMIN', label: 'Finance Admin', desc: 'Expense review, approval & payouts' },
    { role: 'EVENT_COORDINATOR', label: 'Event Coordinator', desc: 'Event schedules, teams & attendance' },
    { role: 'VOLUNTEER', label: 'Volunteer', desc: 'Attendance check-in & task view' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Center Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('/dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <span className="font-serif text-lg font-bold tracking-tight">ॐ</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                  Surat Center
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Gujarat
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Spiritual & Community Management
              </p>
            </div>
          </div>

          {/* Global Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-md relative hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults) setShowSearchDropdown(true);
                }}
                placeholder="Search events, teams, mahatmas, expenses..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 rounded-lg border border-transparent focus:border-emerald-600 focus:outline-hidden transition-all"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {showSearchDropdown && searchResults && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
                {searchResults.totalCount === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 py-1">
                    {/* Events */}
                    {searchResults.events?.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-emerald-600" />
                          Events
                        </div>
                        {searchResults.events.map((item: any) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              onNavigate(item.link);
                              setShowSearchDropdown(false);
                            }}
                            className="px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer flex justify-between items-center text-sm"
                          >
                            <span className="font-medium text-slate-800">{item.title}</span>
                            <span className="text-xs text-slate-500">{item.subtitle}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Teams */}
                    {searchResults.teams?.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-blue-600" />
                          Teams
                        </div>
                        {searchResults.teams.map((item: any) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              onNavigate(item.link);
                              setShowSearchDropdown(false);
                            }}
                            className="px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer flex justify-between items-center text-sm"
                          >
                            <span className="font-medium text-slate-800">{item.title}</span>
                            <span className="text-xs text-slate-500">{item.subtitle}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mahatmas */}
                    {searchResults.mahatmas?.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <UserCheck className="w-3 h-3 text-amber-600" />
                          Mahatmas
                        </div>
                        {searchResults.mahatmas.map((item: any) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              onNavigate(item.link);
                              setShowSearchDropdown(false);
                            }}
                            className="px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer flex justify-between items-center text-sm"
                          >
                            <span className="font-medium text-slate-800">{item.title}</span>
                            <span className="text-xs text-slate-500">{item.subtitle}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Expenses */}
                    {searchResults.expenses?.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Receipt className="w-3 h-3 text-rose-600" />
                          Expenses
                        </div>
                        {searchResults.expenses.map((item: any) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              onNavigate(item.link);
                              setShowSearchDropdown(false);
                            }}
                            className="px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer flex justify-between items-center text-sm"
                          >
                            <span className="font-medium text-slate-800">{item.title}</span>
                            <span className="text-xs font-semibold text-emerald-700">{item.subtitle}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Locations */}
                    {searchResults.locations?.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-purple-600" />
                          Locations
                        </div>
                        {searchResults.locations.map((item: any) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              onNavigate(item.link);
                              setShowSearchDropdown(false);
                            }}
                            className="px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer flex justify-between items-center text-sm"
                          >
                            <span className="font-medium text-slate-800">{item.title}</span>
                            <span className="text-xs text-slate-500">{item.subtitle}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Tools: Role Switcher, Notifications, User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Role Switcher (Demonstrates instant RBAC switching) */}
            <div className="relative">
              <button
                id="role-switcher-btn"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                title="Switch active role to test RBAC capabilities"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Role:</span>
                <span className="text-emerald-800">{user?.role?.replace('_', ' ') || 'Admin'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800">Switch Demo Role (RBAC)</p>
                    <p className="text-[11px] text-slate-500">Test platform views under different privileges</p>
                  </div>
                  <div className="py-1">
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchRole(r.role);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-50 text-xs transition-colors flex flex-col ${
                          user?.role === r.role ? 'bg-emerald-50/60 font-semibold' : ''
                        }`}
                      >
                        <span className="text-slate-900 font-medium flex items-center justify-between">
                          {r.label}
                          {user?.role === r.role && (
                            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">
                              ACTIVE
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Popover */}
            <div ref={notifRef} className="relative">
              <button
                id="notifications-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-800 font-bold rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications right now
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                            !notif.read ? 'bg-emerald-50/30' : ''
                          }`}
                          onClick={() => {
                            if (notif.entityType === 'Event') {
                              onNavigate(`/events/${notif.entityId}`);
                            } else if (notif.entityType === 'Expense') {
                              onNavigate(`/expenses/${notif.entityId}`);
                            }
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Menu */}
            <div ref={userRef} className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-slate-500">{user?.role?.replace('_', ' ')}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Building className="w-4 h-4 text-slate-400" />
                      Center Settings
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
