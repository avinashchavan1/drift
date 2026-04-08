import { useState, useRef, useCallback, useEffect } from 'react';
import { Check, Trash2, Flag, Pencil } from 'lucide-react';
import DateBadge from './DateBadge';
import CategoryChip from './CategoryChip';
import TaskFormSheet from './TaskFormSheet';
import useIsMobile from '../hooks/useIsMobile';

const PRIORITY_CYCLE = { high: 'medium', medium: 'low', low: null, null: 'high' };
const PRIORITY_COLOR = { high: '#E1306C', medium: '#FCAF45', low: '#405DE6' };

export default function TaskItem({ task, onComplete, onUncomplete, onDelete, onUpdate, onCategoryClick }) {
  const [completing, setCompleting] = useState(false);
  const [editing,    setEditing]    = useState(false);
  const [editValue,  setEditValue]  = useState(task.title);
  const [editOpen,   setEditOpen]   = useState(false);
  const isMobile = useIsMobile();
  const editRef    = useRef(null);
  const touchStart = useRef(null);
  const [swipe,    setSwipe]        = useState(0);

  useEffect(() => {
    if (editing) { editRef.current?.focus(); editRef.current?.select(); }
  }, [editing]);

  const handleCheck = useCallback(() => {
    if (task.completed) { onUncomplete(task.id); return; }
    setCompleting(true);
    setTimeout(() => onComplete(task.id), 200);
  }, [task, onComplete, onUncomplete]);

  const submitEdit = useCallback(() => {
    const v = editValue.trim();
    if (v && v !== task.title) onUpdate({ id: task.id, title: v, dueDate: task.dueDate, category: task.category, priority: task.priority });
    setEditing(false);
    setEditValue(task.title);
  }, [editValue, task, onUpdate]);

  const handlePriority = useCallback(e => {
    e.stopPropagation();
    const next = PRIORITY_CYCLE[task.priority ?? 'null'];
    onUpdate({ id: task.id, title: task.title, dueDate: task.dueDate, category: task.category, priority: next });
  }, [task, onUpdate]);

  const onEditKey = useCallback(e => {
    if (e.key === 'Enter')  submitEdit();
    if (e.key === 'Escape') { setEditing(false); setEditValue(task.title); }
  }, [submitEdit, task.title]);

  // Touch swipe-right = complete
  const onTouchStart = e => { touchStart.current = e.touches[0].clientX; };
  const onTouchMove  = e => {
    if (touchStart.current == null) return;
    const dx = e.touches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 4) setSwipe(Math.max(-60, Math.min(80, dx)));
  };
  const onTouchEnd = () => {
    if (swipe > 48 && !task.completed) handleCheck();
    setSwipe(0); touchStart.current = null;
  };

  const hasMeta = !editing && (task.dueDate || task.category);

  if (completing) {
    return (
      <div
        className="task-out flex items-center gap-3 px-4 py-3"
        style={{ background: 'var(--accent-bg)', opacity: 0.85 }}
      >
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--ig-gradient)' }}
        >
          <Check size={10} strokeWidth={3} style={{ color: '#fff' }} />
        </div>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{task.title}</span>
      </div>
    );
  }

  return (
    <div
      className="task-in group flex items-start gap-3 px-4 py-3"
      style={{
        background: 'var(--surface)',
        transition: swipe === 0 ? 'transform .2s ease, background .1s' : 'none',
        transform: `translateX(${swipe}px)`,
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Checkbox */}
      <button
        onClick={handleCheck}
        aria-label={task.completed ? 'Undo' : 'Complete'}
        className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150 hover:scale-110"
        style={task.completed
          ? { background: 'var(--ig-gradient)', borderColor: 'transparent' }
          : { borderColor: 'var(--border-strong)', background: 'transparent' }}
        onMouseEnter={e => { if (!task.completed) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-bg)'; }}}
        onMouseLeave={e => { if (!task.completed) { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'transparent'; }}}
      >
        {task.completed && <Check size={10} strokeWidth={3} style={{ color: '#fff' }} />}
      </button>

      {/* Content column */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={editRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={submitEdit}
            onKeyDown={onEditKey}
            style={{
              width: '100%', fontSize: 14, color: 'var(--text-primary)',
              outline: 'none', background: 'transparent',
              borderBottom: '2px solid var(--accent)', paddingBottom: 1,
            }}
          />
        ) : (
          <span
            onClick={() => !task.completed && setEditing(true)}
            style={{
              fontSize: 14, lineHeight: '1.35', display: 'block',
              userSelect: 'none', cursor: task.completed ? 'default' : 'text',
              color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: task.completed ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </span>
        )}

        {hasMeta && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {task.dueDate  && <DateBadge dueDate={task.dueDate} compact />}
            {task.category && (
              <CategoryChip
                category={task.category}
                onClick={e => { e.stopPropagation(); onCategoryClick?.(task.category); }}
                size="xs"
              />
            )}
          </div>
        )}
      </div>

      {/* Priority + Edit + Delete buttons */}
      {!editing && (
        <div className="flex items-center gap-1 mt-0.5 shrink-0">
          <button
            onClick={handlePriority}
            aria-label={`Priority: ${task.priority ?? 'none'}`}
            title={task.priority ? `Priority: ${task.priority} (click to change)` : 'Set priority'}
            className={task.priority || isMobile ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-150'}
            style={{
              color: PRIORITY_COLOR[task.priority] ?? 'var(--text-faint)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: isMobile ? '6px' : 0,
            }}
          >
            <Flag size={isMobile ? 14 : 12} fill={task.priority ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setEditOpen(true); }}
            aria-label="Edit"
            className={isMobile ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-150'}
            style={{
              color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer',
              padding: isMobile ? '6px' : 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; }}
          >
            <Pencil size={isMobile ? 14 : 12} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(task.id); }}
            aria-label="Delete"
            className={isMobile ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-150'}
            style={{
              color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer',
              padding: isMobile ? '6px' : 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; }}
          >
            <Trash2 size={isMobile ? 14 : 13} />
          </button>
        </div>
      )}

      <TaskFormSheet
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialValues={task}
        onSave={data => onUpdate(data)}
      />
    </div>
  );
}
