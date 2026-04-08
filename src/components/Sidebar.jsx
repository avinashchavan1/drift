import { useMemo } from 'react';
import { isToday, isPast, startOfDay } from 'date-fns';
import { CheckSquare, Calendar, Zap, X, User } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { getCategoryColor } from '../utils/parseInput';

const NAV = [
  { id: 'today',    label: 'Today',    icon: CheckSquare },
  { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  { id: 'focus',    label: 'Focus',    icon: Zap },
  { id: 'profile',  label: 'Profile',  icon: User },
];

export default function Sidebar({ view, onViewChange, categoryFilter, onCategoryClick, user }) {
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
    <aside style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%', userSelect: 'none', padding: '20px 12px 24px' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 24 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ig-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckSquare size={14} strokeWidth={2.5} style={{ color: '#fff' }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Drift</span>
      </div>

      {/* Nav */}
      <nav style={{ marginBottom: 16 }}>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = view === id && !categoryFilter;
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8, marginBottom: 2,
                fontSize: 13.5, fontWeight: 500,
                background: active ? 'var(--accent-bg)' : 'transparent',
                color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                transition: 'background .1s, color .1s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 2}
                style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} />
              <span>{label}</span>
              {id === 'today' && todayCount > 0 && (
                <span style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                  borderRadius: 9999, minWidth: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
                  background: 'var(--badge-overdue-bg)', color: 'var(--badge-overdue-text)',
                }}>
                  {todayCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      {categories.length > 0 && (
        <div style={{ height: 1, background: 'var(--border)', margin: '0 12px 12px' }} />
      )}

      {/* Tags */}
      {categories.length > 0 && (
        <>
          <p style={{ padding: '0 12px', marginBottom: 4, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
            Tags
          </p>
          <div>
            {categories.map(([cat, count]) => {
              const p = getCategoryColor(cat);
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryClick(cat)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', borderRadius: 8, marginBottom: 2,
                    fontSize: 13, background: active ? 'var(--surface-hover)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: active ? 500 : 400,
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: p.dot }} />
                  <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>#{cat}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{count}</span>
                  {active && (
                    <span
                      onClick={e => { e.stopPropagation(); onCategoryClick(null); }}
                      style={{ color: 'var(--text-faint)', lineHeight: 1, marginLeft: 2, cursor: 'pointer' }}
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

      {/* Footer: user info (click → profile) + quick-add hint */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', padding: '10px 12px 4px' }}>
        {user && (
          <button
            onClick={() => onViewChange('profile')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 9,
              padding: '7px 8px', borderRadius: 8, marginBottom: 6,
              background: view === 'profile' ? 'var(--accent-bg)' : 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              transition: 'background .1s',
            }}
            onMouseEnter={e => { if (view !== 'profile') e.currentTarget.style.background = 'var(--surface-hover)'; }}
            onMouseLeave={e => { if (view !== 'profile') e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: 'var(--ig-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>
                {user.name ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'}
              </span>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
            </div>
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px' }}>
          <kbd style={{ fontSize: 10, fontFamily: 'ui-monospace,monospace', background: 'var(--surface-input)', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>
            /
          </kbd>
          <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>quick add</span>
        </div>
      </div>
    </aside>
  );
}
