import { format, isToday, isTomorrow, isPast, startOfDay } from 'date-fns';

const STYLES = {
  overdue:  { bg: '#fef2f2', text: '#ef4444', border: '#fecaca' },
  today:    { bg: '#fff7ed', text: '#f97316', border: '#fed7aa' },
  tomorrow: { bg: '#eff6ff', text: '#3b82f6', border: '#bfdbfe' },
  future:   { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
};

export default function DateBadge({ dueDate, compact = false }) {
  if (!dueDate) return null;

  const d = new Date(dueDate);
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  const time    = hasTime ? ` ${format(d, 'h:mm a')}` : '';

  let label, s;
  if (!isToday(d) && isPast(startOfDay(d))) {
    label = format(d, 'MMM d') + time;
    s = STYLES.overdue;
  } else if (isToday(d)) {
    label = `Today${time}`;
    s = STYLES.today;
  } else if (isTomorrow(d)) {
    label = `Tomorrow${time}`;
    s = STYLES.tomorrow;
  } else {
    label = format(d, 'MMM d') + time;
    s = STYLES.future;
  }

  return (
    <span
      className="inline-flex items-center font-medium rounded-full whitespace-nowrap"
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        fontSize: compact ? 11 : 12,
        padding: compact ? '1px 8px' : '2px 10px',
      }}
    >
      {label}
    </span>
  );
}
