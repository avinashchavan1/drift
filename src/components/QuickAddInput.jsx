import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X, CornerDownLeft } from 'lucide-react';
import CategoryChip from './CategoryChip';
import { parseTaskInput } from '../utils/parseInput';
import { format, isToday, isTomorrow } from 'date-fns';

function fmtPreview(date) {
  const t = format(date, 'HH:mm') !== '00:00' ? ` ${format(date, 'h:mm a')}` : '';
  if (isToday(date))    return `Today${t}`;
  if (isTomorrow(date)) return `Tomorrow${t}`;
  return format(date, 'EEE, MMM d') + t;
}

export default function QuickAddInput({ onAdd, autoFocus = false }) {
  const [value,   setValue]   = useState('');
  const [parsed,  setParsed]  = useState({ title: '', dueDate: null, category: null });
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);

  // "/" or ⌘K focuses the input
  useEffect(() => {
    const handler = e => {
      if (e.key === '/' && document.activeElement !== ref.current) {
        e.preventDefault(); ref.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); ref.current?.focus(); ref.current?.select();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const clear = useCallback(() => {
    setValue('');
    setParsed({ title: '', dueDate: null, category: null });
    ref.current?.focus();
  }, []);

  const submit = useCallback(() => {
    if (!parsed.title.trim()) return;
    onAdd(parsed);
    clear();
  }, [parsed, onAdd, clear]);

  const onChange = useCallback(e => {
    const v = e.target.value;
    setValue(v);
    setParsed(v.trim() ? parseTaskInput(v) : { title: '', dueDate: null, category: null });
  }, []);

  const onKeyDown = useCallback(e => {
    if (e.key === 'Enter')  submit();
    if (e.key === 'Escape') { clear(); ref.current?.blur(); }
  }, [submit, clear]);

  const ring = focused
    ? '0 0 0 3px rgba(59,130,246,0.15), 0 1px 3px rgba(0,0,0,0.06)'
    : '0 1px 3px rgba(0,0,0,0.06)';
  const border = focused ? '#93c5fd' : '#e2e8f0';

  return (
    <div className="mb-8">
      {/* Input row */}
      <div
        className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-3 transition-shadow duration-150"
        style={{ border: `1.5px solid ${border}`, boxShadow: ring }}
      >
        <Plus size={15} style={{ color: focused ? '#3b82f6' : '#94a3b8', flexShrink: 0 }} />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder='Add a task — "standup tomorrow 9am #work"'
          className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
        />
        {value ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onMouseDown={e => { e.preventDefault(); clear(); }}
              className="text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={13} />
            </button>
            <button
              onMouseDown={e => { e.preventDefault(); submit(); }}
              className="flex items-center gap-1 text-white text-[12px] font-semibold rounded-lg px-3 py-1.5 transition-colors duration-100"
              style={{ background: '#3b82f6' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2563eb'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#3b82f6'; }}
            >
              Add <CornerDownLeft size={10} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <kbd className="hidden sm:block shrink-0 text-[10px] font-mono text-slate-300 px-1.5 py-0.5 rounded"
            style={{ border: '1px solid #e2e8f0', background: '#f8fafc' }}>
            /
          </kbd>
        )}
      </div>

      {/* Parsed chips */}
      {(parsed.dueDate || parsed.category) && (
        <div className="flex items-center gap-2 mt-2" style={{ paddingLeft: 2 }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Detected →</span>
          {parsed.dueDate && (
            <span className="text-[11px] font-medium rounded-full px-2.5 py-0.5"
              style={{ background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa' }}>
              {fmtPreview(parsed.dueDate)}
            </span>
          )}
          {parsed.category && <CategoryChip category={parsed.category} size="xs" />}
        </div>
      )}
    </div>
  );
}
