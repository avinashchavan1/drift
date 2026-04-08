import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sun, Moon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TodayView from './views/TodayView';
import UpcomingView from './views/UpcomingView';
import FocusView from './views/FocusView';
import ProfileView from './views/ProfileView';
import AuthView from './views/AuthView';
import MobileNav from './components/MobileNav';
import useIsMobile from './hooks/useIsMobile';
import { ThemeProvider, useTheme } from './hooks/useTheme.jsx';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function AppInner() {
  const [view, setView]                     = useState('today');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [addingAccount, setAddingAccount]   = useState(false);
  const isMobile                            = useIsMobile();
  const { dark, toggle }                    = useTheme();
  const { user, loading, logout, switchAccount } = useAuth();

  const handleCategoryClick = useCallback((cat) =>
    setCategoryFilter(prev => prev === cat ? null : cat), []);

  const handleViewChange = useCallback((v) => {
    setView(v);
    setCategoryFilter(null);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    queryClient.clear();
  }, [logout]);

  const handleSwitchAccount = useCallback((email) => {
    switchAccount(email);
    queryClient.clear();
    setView('today');
  }, [switchAccount]);

  // Still verifying stored token
  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not authenticated — show login/register
  if (!user) return <AuthView />;

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Sidebar — desktop only */}
      {!isMobile && (
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid var(--border)', background: 'var(--surface)' }}>
          <Sidebar
            view={view}
            onViewChange={handleViewChange}
            categoryFilter={categoryFilter}
            onCategoryClick={handleCategoryClick}
            user={user}
          />
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', minHeight: 0, background: 'var(--bg)' }}>
        <div style={{ maxWidth: 576, margin: '0 auto', padding: isMobile ? '32px 16px 96px' : '40px 32px 40px' }}>
          {view === 'today'    && <TodayView    categoryFilter={categoryFilter} onCategoryClick={handleCategoryClick} />}
          {view === 'upcoming' && <UpcomingView  categoryFilter={categoryFilter} onCategoryClick={handleCategoryClick} />}
          {view === 'focus'    && <FocusView     onCategoryClick={handleCategoryClick} onViewChange={handleViewChange} />}
          {view === 'profile'  && <ProfileView   onLogout={handleLogout} onAddAccount={() => setAddingAccount(true)} onSwitchAccount={handleSwitchAccount} />}
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      {isMobile && <MobileNav view={view} onViewChange={handleViewChange} />}

      {/* Add-account overlay */}
      {addingAccount && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)' }}>
          <AuthView addMode onDone={() => { setAddingAccount(false); queryClient.clear(); }} />
        </div>
      )}

      {/* Top-right controls */}
      <div style={{ position: 'fixed', top: 14, right: 14, zIndex: 45, display: 'flex', gap: 8 }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          style={iconBtnStyle}
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Profile/logout now handled in profile view */}
      </div>
    </div>
  );
}

const iconBtnStyle = {
  width: 34, height: 34, borderRadius: '50%',
  background: 'var(--surface)', border: '1px solid var(--border)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: 'var(--text-secondary)',
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <AppInner />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
