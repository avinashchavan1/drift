import { CheckSquare, Calendar, Zap } from 'lucide-react';

const ITEMS = [
  { id: 'today',    label: 'Today',    icon: CheckSquare },
  { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  { id: 'focus',    label: 'Focus',    icon: Zap },
];

export default function MobileNav({ view, onViewChange }) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex z-50"
      style={{ background: '#fff', borderTop: '1px solid #f1f5f9' }}
    >
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const active = view === id;
        return (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
            style={{ color: active ? '#3b82f6' : '#94a3b8' }}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            <span style={{ fontSize: 11, fontWeight: active ? 600 : 400 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
