import { CheckSquare, Calendar, Zap, User } from 'lucide-react';

const ITEMS = [
  { id: 'today',    label: 'Today',    icon: CheckSquare },
  { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  { id: 'focus',    label: 'Focus',    icon: Zap },
  { id: 'profile',  label: 'Profile',  icon: User },
];

export default function MobileNav({ view, onViewChange }) {
  return (
    <nav
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex', zIndex: 50,
        background: 'var(--nav-bg)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const active = view === id;
        return (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3, padding: '10px 0 12px',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            {active ? (
              <>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--ig-gradient)',
                  borderRadius: 10, padding: '5px 6px',
                }}>
                  <Icon size={17} strokeWidth={2.5} style={{ color: '#fff' }} />
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '-0.01em',
                  background: 'var(--ig-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {label}
                </span>
              </>
            ) : (
              <>
                <Icon size={22} strokeWidth={1.8} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)' }}>{label}</span>
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
}
