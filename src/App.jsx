import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import TodayView from './views/TodayView';
import UpcomingView from './views/UpcomingView';
import FocusView from './views/FocusView';
import MobileNav from './components/MobileNav';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

function AppInner() {
  const [view, setView]               = useState('today');
  const [categoryFilter, setCategoryFilter] = useState(null);

  const handleCategoryClick = useCallback((cat) =>
    setCategoryFilter(prev => prev === cat ? null : cat), []);

  const handleViewChange = useCallback((v) => {
    setView(v);
    setCategoryFilter(null);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar — md and up */}
      <div className="hidden md:flex flex-col h-full bg-white" style={{ borderRight: '1px solid #f1f5f9', width: 220 }}>
        <Sidebar
          view={view}
          onViewChange={handleViewChange}
          categoryFilter={categoryFilter}
          onCategoryClick={handleCategoryClick}
        />
      </div>

      {/* Main */}
      <main className="flex-1 overflow-y-auto min-h-0 bg-white">
        <div className="max-w-xl mx-auto px-8 pt-10 pb-28 md:pb-10">
          {view === 'today'    && <TodayView    categoryFilter={categoryFilter} onCategoryClick={handleCategoryClick} />}
          {view === 'upcoming' && <UpcomingView  categoryFilter={categoryFilter} onCategoryClick={handleCategoryClick} />}
          {view === 'focus'    && <FocusView     onCategoryClick={handleCategoryClick} />}
        </div>
      </main>

      <MobileNav view={view} onViewChange={handleViewChange} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
