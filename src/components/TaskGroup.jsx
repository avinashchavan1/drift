const COLORS = {
  red:    { dot: 'var(--group-red-dot)',    text: 'var(--group-red-text)' },
  orange: { dot: 'var(--group-orange-dot)', text: 'var(--group-orange-text)' },
  gray:   { dot: 'var(--group-gray-dot)',   text: 'var(--group-gray-text)' },
  blue:   { dot: 'var(--group-blue-dot)',   text: 'var(--group-blue-text)' },
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
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-faint)' }}>{count}</span>
      </div>

      {/* Tasks */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {items.map((child, i) => (
          <div
            key={child.key ?? i}
            style={i > 0 ? { borderTop: '1px solid var(--border-subtle)' } : {}}
          >
            {child}
          </div>
        ))}
      </div>
    </section>
  );
}
