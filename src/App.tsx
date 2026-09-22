import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { MobileNav } from './components/layout/MobileNav.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { EventsListPage } from './pages/EventsListPage.tsx';
import { EventDetailPage } from './pages/EventDetailPage.tsx';
import { ArchivesPage } from './pages/ArchivesPage.tsx';
import { TeamsPage } from './pages/TeamsPage.tsx';
import { MahatmasPage } from './pages/MahatmasPage.tsx';
import { ExpensesPage } from './pages/ExpensesPage.tsx';
import { LocationsPage } from './pages/LocationsPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { EventFormModal } from './components/events/EventFormModal.tsx';
import { Sparkles, Plus, Calendar, Receipt } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/dashboard');

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any | null>(null);
  const [expenseEventId, setExpenseEventId] = useState<string | undefined>(undefined);

  // Sync with browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path && path !== '/') {
        setCurrentPath(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCreateEvent = () => {
    setEventToEdit(null);
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (event: any) => {
    setEventToEdit(event);
    setIsEventModalOpen(true);
  };

  const handleOpenCreateExpenseWithEvent = (eventId: string) => {
    setExpenseEventId(eventId);
    navigate('/expenses');
  };

  // Route matching
  const renderCurrentView = () => {
    // Event Detail: /events/:id
    if (currentPath.startsWith('/events/') && currentPath !== '/events') {
      const eventId = currentPath.replace('/events/', '');
      return (
        <EventDetailPage
          eventId={eventId}
          onNavigate={navigate}
          onOpenCreateExpenseWithEvent={handleOpenCreateExpenseWithEvent}
          onEditEvent={handleOpenEditEvent}
        />
      );
    }

    switch (currentPath) {
      case '/':
      case '/dashboard':
        return (
          <DashboardPage
            onNavigate={navigate}
            onOpenCreateEvent={handleOpenCreateEvent}
            onOpenCreateExpense={() => navigate('/expenses')}
          />
        );

      case '/events':
        return (
          <EventsListPage
            onNavigate={navigate}
            onOpenCreateEvent={handleOpenCreateEvent}
            onEditEvent={handleOpenEditEvent}
          />
        );

      case '/archives':
        return <ArchivesPage onNavigate={navigate} />;

      case '/teams':
        return <TeamsPage onNavigate={navigate} />;

      case '/mahatmas':
        return <MahatmasPage onNavigate={navigate} />;

      case '/expenses':
        return (
          <ExpensesPage
            onNavigate={navigate}
            initialEventId={expenseEventId}
          />
        );

      case '/locations':
        return <LocationsPage onNavigate={navigate} />;

      case '/reports':
        return <ReportsPage onNavigate={navigate} />;

      case '/settings':
        return <SettingsPage />;

      default:
        // Default to dashboard
        return (
          <DashboardPage
            onNavigate={navigate}
            onOpenCreateEvent={handleOpenCreateEvent}
          />
        );
    }
  };

  const canCreate =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'CENTER_ADMIN' ||
    user?.role === 'EVENT_COORDINATOR';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Center Announcement / Traditional Strip */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 hidden sm:block border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-300">Surat Center</span>
            <span>•</span>
            <span className="text-emerald-200">
              Spiritual Gathering & Satsang Management Platform — Gujarat, India
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-emerald-300">
            <span>Center Code: SUR-01</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live System Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar onNavigate={navigate} />

      {/* Main App Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Persistent Desktop Sidebar */}
        <Sidebar currentPath={currentPath} onNavigate={navigate} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentPath={currentPath} onNavigate={navigate} />

      {/* Global Event Form Modal */}
      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEventToEdit(null);
        }}
        onSuccess={() => {
          // If on events page or dashboard, trigger refresh
          if (currentPath === '/events' || currentPath === '/dashboard') {
            window.location.reload();
          } else {
            navigate('/events');
          }
        }}
        eventToEdit={eventToEdit}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
