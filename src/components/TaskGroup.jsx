// Simple section — no card wrapping, just a label + divider + task list

const COLORS = {
  red:    { dot: '#f87171', text: '#ef4444' },
  orange: { dot: '#fb923c', text: '#f97316' },
  gray:   { dot: '#94a3b8', text: '#94a3b8' },
  blue:   { dot: '#60a5fa', text: '#3b82f6' },
};

export default function TaskGroup({ label, count, color = 'gray', children }) {
  const c = COLORS[color] || COLORS.gray;

  const items = Array.isArray(children)
    ? children.flat().filter(Boolean)
    : children ? [children] : [];

  if (items.length === 0) return null;

  return (
    <section className="mb-8">
      {/* Section label row */}
      <div className="flex items-center gap-2.5 mb-1" style={{ paddingLeft: 2 }}>
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
        <span
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: c.text }}
        >
          {label}
        </span>
        <span className="text-[11px] font-medium" style={{ color: '#cbd5e1' }}>{count}</span>
      </div>

      {/* Tasks */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #f1f5f9' }}>
        {items.map((child, i) => (
          <div
            key={child.key ?? i}
            style={i > 0 ? { borderTop: '1px solid #f8fafc' } : {}}
          >
            {child}
          </div>
        ))}
      </div>
    </section>
  );
}
