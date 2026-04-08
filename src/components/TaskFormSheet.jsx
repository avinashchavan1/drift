import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, Hash, Flag } from 'lucide-react';
import { CATEGORY_PALETTES } from '../utils/parseInput';

function toDateString(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toTimeString(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d)) return '';
  const h = d.getHours(), m = d.getMinutes();
  return (h || m) ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` : '';
}

const PRIORITIES = [
  { value: 'high',   label: 'High',   color: '#E1306C' },
  { value: 'medium', label: 'Medium', color: '#FCAF45' },
  { value: 'low',    label: 'Low',    color: '#405DE6' },
];

const fieldRow = (active) => ({
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '12px 16px', borderRadius: 14,
  background: active ? 'var(--accent-bg)' : 'var(--surface-input)',
  border: `1.5px solid ${active ? 'var(--accent)' : 'transparent'}`,
  marginBottom: 10,
});

const nativeInput = (hasValue) => ({
  flex: 1, border: 'none', outline: 'none',
  background: 'transparent', fontFamily: 'inherit',
  fontSize: 14, fontWeight: hasValue ? 500 : 400,
  color: hasValue ? 'var(--accent-text)' : 'var(--text-muted)',
  cursor: 'pointer', minWidth: 0,
});

const clearBtn = {
  background: 'none', border: 'none', padding: 0,
  cursor: 'pointer', color: 'var(--accent)', lineHeight: 1, flexShrink: 0,
};

// Pass `initialValues` + `onSave` for edit mode; `onAdd` for create mode.
export default function TaskFormSheet({ isOpen, onClose, onAdd, onSave, initialValues }) {
  const editMode = !!initialValues;
  const [title,    setTitle]    = useState('');
  const [date,     setDate]     = useState('');
  const [time,     setTime]     = useState('');
  const [category, setCategory] = useState(null);
  const [priority, setPriority] = useState(null);
  const titleRef = useRef(null);

  // Populate / reset form when sheet opens or initialValues change
  useEffect(() => {
    if (isOpen) {
      if (editMode) {
        setTitle(initialValues.title || '');
        setDate(toDateString(initialValues.dueDate));
        setTime(toTimeString(initialValues.dueDate));
        setCategory(initialValues.category || null);
        setPriority(initialValues.priority || null);
      } else {
        setTitle(''); setDate(''); setTime(''); setCategory(null); setPriority(null);
      }
      const t = setTimeout(() => titleRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
    setTitle(''); setDate(''); setTime(''); setCategory(null); setPriority(null);
  }, [isOpen]);

  // Prevent background scroll while sheet is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const canAdd = title.trim().length > 0;

  const handleSubmit = () => {
    if (!canAdd) return;
    let dueDate = null;
    if (date) {
      const [y, m, d] = date.split('-').map(Number);
      const [h, min]  = time ? time.split(':').map(Number) : [0, 0];
      dueDate = new Date(y, m - 1, d, h, min, 0, 0);
    }
    const payload = { title: title.trim(), dueDate, category, priority };
    if (editMode) onSave({ ...payload, id: initialValues.id });
    else          onAdd(payload);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'var(--scrim)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Sheet */}
      <div
        className="sheet-in"
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0,
          zIndex: 70,
          background: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.20)',
          maxHeight: 'calc(100dvh - 56px)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Pull handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 0' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {editMode ? 'Edit Task' : 'New Task'}
            </span>
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--surface-input)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Title input */}
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter'  && canAdd) handleSubmit();
              if (e.key === 'Escape')           onClose();
            }}
            placeholder="What needs to be done?"
            style={{
              display: 'block', width: '100%',
              border: 'none', outline: 'none', padding: 0,
              background: 'transparent', fontFamily: 'inherit',
              fontSize: 22, fontWeight: 500, lineHeight: 1.3,
              color: 'var(--text-primary)', marginBottom: 24,
            }}
          />

          {/* Due date */}
          <div style={fieldRow(!!date)}>
            <Calendar size={16} style={{ color: date ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={nativeInput(!!date)}
            />
            {date && (
              <button type="button" style={clearBtn}
                onMouseDown={e => e.preventDefault()}
                onClick={() => { setDate(''); setTime(''); }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Time — only when date is set */}
          {date && (
            <div style={fieldRow(!!time)}>
              <Clock size={16} style={{ color: time ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                placeholder="Add time"
                style={nativeInput(!!time)}
              />
              {time && (
                <button type="button" style={clearBtn}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => setTime('')}>
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Priority */}
          <div style={{ marginTop: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Flag size={12} style={{ color: 'var(--text-faint)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                Priority
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {PRIORITIES.map(({ value, label, color }) => {
                const active = priority === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPriority(active ? null : value)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 20,
                      background: active ? `${color}22` : 'var(--surface-input)',
                      color:      active ? color : 'var(--text-secondary)',
                      border:     `1.5px solid ${active ? color : 'transparent'}`,
                      cursor: 'pointer', transition: 'all .12s',
                    }}
                  >
                    <Flag size={10} fill={active ? color : 'none'} stroke={active ? color : 'currentColor'} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div style={{ marginTop: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Hash size={12} style={{ color: 'var(--text-faint)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                Category
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(CATEGORY_PALETTES).map(([cat, p]) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(active ? null : cat)}
                    style={{
                      fontSize: 13, fontWeight: 500, padding: '7px 16px', borderRadius: 20,
                      background: active ? p.bg   : 'var(--surface-input)',
                      color:      active ? p.text : 'var(--text-secondary)',
                      border:     `1.5px solid ${active ? p.bg : 'transparent'}`,
                      cursor: 'pointer', transition: 'all .12s',
                    }}
                  >
                    #{cat}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Sticky footer — Add Task button always visible above keyboard */}
        <div style={{
          flexShrink: 0, padding: '12px 20px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
          borderTop: '1px solid var(--border-subtle)', background: 'var(--surface)',
        }}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canAdd}
            style={{
              display: 'block', width: '100%', padding: '15px',
              borderRadius: 14, fontSize: 15, fontWeight: 600, border: 'none',
              background: canAdd ? 'var(--ig-gradient)' : 'var(--surface-input)',
              color:      canAdd ? '#fff'          : 'var(--text-faint)',
              cursor:     canAdd ? 'pointer'       : 'default',
              transition: 'background .15s, color .15s',
            }}
          >
            {editMode ? 'Save Changes' : 'Add Task'}
          </button>
        </div>

      </div>
    </>,
    document.body
  );
}
