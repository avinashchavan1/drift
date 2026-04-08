import { useMemo, useState } from 'react';
import { isToday, isPast, startOfDay, format } from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react';
import QuickAddInput from '../components/QuickAddInput';
import TaskItem from '../components/TaskItem';
import TaskGroup from '../components/TaskGroup';
import {
  useTasks, useAddTask, useCompleteTask,
  useUncompleteTask, useDeleteTask, useUpdateTask,
} from '../hooks/useTasks';

const isOverdue  = t => !!t.dueDate && !isToday(new Date(t.dueDate)) && isPast(startOfDay(new Date(t.dueDate)));
const isDueToday = t => !!t.dueDate && isToday(new Date(t.dueDate));
const byDate     = (a, b) => new Date(a.dueDate) - new Date(b.dueDate);
const byCreated  = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

export default function TodayView({ categoryFilter, onCategoryClick }) {
  const { data: tasks = [] } = useTasks();
  const [showCompleted, setShowCompleted] = useState(false);

  const addTask        = useAddTask();
  const completeTask   = useCompleteTask();
  const uncompleteTask = useUncompleteTask();
  const deleteTask     = useDeleteTask();
  const updateTask     = useUpdateTask();

  const active = useMemo(() => {
    let t = tasks.filter(t => !t.completed);
    return categoryFilter ? t.filter(t => t.category === categoryFilter) : t;
  }, [tasks, categoryFilter]);

  const completed = useMemo(() => {
    let t = tasks.filter(t => t.completed);
    if (categoryFilter) t = t.filter(t => t.category === categoryFilter);
    return t.sort((a, b) =>
      new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt)
    ).slice(0, 20);
  }, [tasks, categoryFilter]);

  const overdue    = useMemo(() => active.filter(isOverdue).sort(byDate),    [active]);
  const today      = useMemo(() => active.filter(isDueToday).sort(byDate),   [active]);
  const noDeadline = useMemo(() => active.filter(t => !t.dueDate).sort(byCreated), [active]);
  const totalDue   = overdue.length + today.length;
  const isEmpty    = overdue.length === 0 && today.length === 0 && noDeadline.length === 0;

  const itemProps = {
    onComplete:   id   => completeTask.mutate(id),
    onUncomplete: id   => uncompleteTask.mutate(id),
    onDelete:     id   => deleteTask.mutate(id),
    onUpdate:     data => updateTask.mutate(data),
    onCategoryClick,
  };

  return (
    <div>
      {/* Page heading */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--text-primary)', margin: 0 }}>
          {format(new Date(), 'EEEE')}
        </h1>
        <p style={{ marginTop: 4, fontSize: 13, color: 'var(--text-muted)' }}>
          {format(new Date(), 'MMMM d')}
          {totalDue > 0 && (
            <span style={{ color: 'var(--badge-today-text)', fontWeight: 500 }}>&ensp;· {totalDue} due</span>
          )}
          {categoryFilter && (
            <span style={{ color: 'var(--accent)' }}>&ensp;· #{categoryFilter}</span>
          )}
        </p>
      </div>

      <QuickAddInput onAdd={d => addTask.mutate(d)} />

      {/* Empty state */}
      {isEmpty && (
        <div style={{ textAlign: 'center', paddingTop: 64 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-input)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span style={{ fontSize: 22 }}>✓</span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)' }}>All clear</p>
          <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 6 }}>
            Press{' '}
            <kbd style={{ fontFamily: 'ui-monospace,monospace', background: 'var(--surface-input)', padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
              /
            </kbd>
            {' '}to add something
          </p>
        </div>
      )}

      {/* Task groups */}
      <TaskGroup label="Overdue" count={overdue.length} color="red">
        {overdue.map(t => <TaskItem key={t.id} task={t} {...itemProps} />)}
      </TaskGroup>

      <TaskGroup label="Today" count={today.length} color="orange">
        {today.map(t => <TaskItem key={t.id} task={t} {...itemProps} />)}
      </TaskGroup>

      <TaskGroup label="No deadline" count={noDeadline.length} color="gray">
        {noDeadline.map(t => <TaskItem key={t.id} task={t} {...itemProps} />)}
      </TaskGroup>

      {/* Completed toggle */}
      {completed.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => setShowCompleted(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 12, color: 'var(--text-muted)', padding: '6px 2px',
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              transition: 'color .1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {showCompleted
              ? <ChevronDown  size={13} style={{ color: 'var(--text-faint)' }} />
              : <ChevronRight size={13} style={{ color: 'var(--text-faint)' }} />}
            <span style={{ fontWeight: 500 }}>{completed.length} completed</span>
          </button>

          {showCompleted && (
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', marginTop: 4 }}>
              {completed.map((t, i) => (
                <div key={t.id} style={i > 0 ? { borderTop: '1px solid var(--border-subtle)' } : {}}>
                  <TaskItem task={t} {...itemProps} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
