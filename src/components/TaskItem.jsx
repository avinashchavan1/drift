import { useState, useRef, useCallback, useEffect } from 'react';
import { Check, Trash2 } from 'lucide-react';
import DateBadge from './DateBadge';
import CategoryChip from './CategoryChip';

export default function TaskItem({ task, onComplete, onUncomplete, onDelete, onUpdate, onCategoryClick }) {
  const [completing, setCompleting] = useState(false);
  const [editing,    setEditing]    = useState(false);
  const [editValue,  setEditValue]  = useState(task.title);
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
    if (v && v !== task.title) onUpdate({ id: task.id, title: v });
    setEditing(false);
    setEditValue(task.title);
  }, [editValue, task, onUpdate]);

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

  if (completing) {
    return (
      <div className="task-out flex items-center gap-3 px-4 py-3.5 bg-blue-50/40">
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: '#3b82f6' }}>
          <Check size={10} strokeWidth={3} className="text-white" />
        </div>
        <span className="text-sm text-slate-400 line-through">{task.title}</span>
      </div>
    );
  }

  return (
    <div
      className="task-in group flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50 transition-colors duration-100 cursor-default"
      style={{ transform: `translateX(${swipe}px)`, transition: swipe === 0 ? 'transform .2s ease, background .1s' : 'none' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Checkbox */}
      <button
        onClick={handleCheck}
        aria-label={task.completed ? 'Undo' : 'Complete'}
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150 hover:scale-110"
        style={task.completed
          ? { background: '#3b82f6', borderColor: '#3b82f6' }
          : { borderColor: '#cbd5e1', background: 'transparent' }}
        onMouseEnter={e => { if (!task.completed) { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.background = '#eff6ff'; }}}
        onMouseLeave={e => { if (!task.completed) { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'transparent'; }}}
      >
        {task.completed && <Check size={10} strokeWidth={3} className="text-white" />}
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={editRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={submitEdit}
            onKeyDown={onEditKey}
            className="w-full text-sm text-slate-800 outline-none bg-transparent"
            style={{ borderBottom: '2px solid #3b82f6', paddingBottom: 1 }}
          />
        ) : (
          <span
            onClick={() => !task.completed && setEditing(true)}
            className={`text-sm block truncate leading-normal select-none ${
              task.completed
                ? 'text-slate-400 line-through'
                : 'text-slate-800 cursor-text'
            }`}
          >
            {task.title}
          </span>
        )}
      </div>

      {/* Right meta */}
      {!editing && (
        <div className="flex items-center gap-2 shrink-0">
          {task.dueDate  && <DateBadge dueDate={task.dueDate} compact />}
          {task.category && (
            <CategoryChip
              category={task.category}
              onClick={e => { e.stopPropagation(); onCategoryClick?.(task.category); }}
              size="xs"
            />
          )}
          <button
            onClick={e => { e.stopPropagation(); onDelete(task.id); }}
            aria-label="Delete"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-slate-300 hover:text-red-400"
            style={{ marginLeft: 2 }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
