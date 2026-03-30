import { useMemo } from 'react';
import { isToday, isPast, startOfDay } from 'date-fns';
import { CheckSquare, Calendar, Zap, X } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { getCategoryColor } from '../utils/parseInput';

const NAV = [
  { id: 'today',    label: 'Today',    icon: CheckSquare },
  { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  { id: 'focus',    label: 'Focus',    icon: Zap },
];

export default function Sidebar({ view, onViewChange, categoryFilter, onCategoryClick }) {
  const { data: tasks = [] } = useTasks();

  const todayCount = useMemo(() => tasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    const d = new Date(t.dueDate);
    return isToday(d) || isPast(startOfDay(d));
  }).length, [tasks]);

  const categories = useMemo(() => {
    const counts = {};
    tasks.forEach(t => {
      if (!t.completed && t.category)
        counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [tasks]);

  return (
    <aside className="w-full flex flex-col h-full select-none" style={{ padding: '20px 12px 24px' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-6">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#3b82f6' }}>
          <CheckSquare size={14} strokeWidth={2.5} className="text-white" />
        </div>
        <span className="text-[15px] font-semibold text-slate-900 tracking-tight">FlowList</span>
      </div>

      {/* Nav */}
      <nav className="space-y-0.5 mb-4">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = view === id && !categoryFilter;
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors duration-100"
              style={{
                background: active ? '#eff6ff' : 'transparent',
                color: active ? '#2563eb' : '#64748b',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 2}
                style={{ color: active ? '#3b82f6' : '#94a3b8' }} />
              <span>{label}</span>
              {id === 'today' && todayCount > 0 && (
                <span className="ml-auto text-[11px] font-bold rounded-full flex items-center justify-center"
                  style={{ background: '#fee2e2', color: '#ef4444', minWidth: 18, height: 18, padding: '0 5px' }}>
                  {todayCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      {categories.length > 0 && (
        <div style={{ height: 1, background: '#f1f5f9', margin: '0 12px 12px' }} />
      )}

      {/* Tags */}
      {categories.length > 0 && (
        <>
          <p className="px-3 mb-1" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#cbd5e1' }}>
            Tags
          </p>
          <div className="space-y-0.5">
            {categories.map(([cat, count]) => {
              const p = getCategoryColor(cat);
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryClick(cat)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-colors duration-100"
                  style={{ background: active ? '#f8fafc' : 'transparent', color: active ? '#334155' : '#64748b', fontWeight: active ? 500 : 400 }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.dot }} />
                  <span className="flex-1 text-left truncate">#{cat}</span>
                  <span style={{ fontSize: 11, color: '#cbd5e1' }}>{count}</span>
                  {active && (
                    <span
                      onClick={e => { e.stopPropagation(); onCategoryClick(null); }}
                      style={{ color: '#cbd5e1', lineHeight: 1, marginLeft: 2 }}
                      className="hover:text-slate-400 transition-colors"
                    >
                      <X size={11} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Footer hint */}
      <div className="mt-auto flex items-center gap-1.5 px-3">
        <kbd style={{ fontSize: 10, fontFamily: 'ui-monospace,monospace', background: '#f8fafc', color: '#94a3b8', padding: '2px 6px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
          /
        </kbd>
        <span style={{ fontSize: 11, color: '#cbd5e1' }}>quick add</span>
      </div>
    </aside>
  );
}
