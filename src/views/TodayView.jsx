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
      <div className="mb-8">
        <h1 className="font-semibold tracking-tight text-slate-900" style={{ fontSize: 26, lineHeight: 1.2 }}>
          {format(new Date(), 'EEEE')}
        </h1>
        <p className="mt-1" style={{ fontSize: 13, color: '#94a3b8' }}>
          {format(new Date(), 'MMMM d')}
          {totalDue > 0 && (
            <span style={{ color: '#f97316', fontWeight: 500 }}>&ensp;· {totalDue} due</span>
          )}
          {categoryFilter && (
            <span style={{ color: '#3b82f6' }}>&ensp;· #{categoryFilter}</span>
          )}
        </p>
      </div>

      <QuickAddInput onAdd={d => addTask.mutate(d)} autoFocus />

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center" style={{ paddingTop: 64 }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#f0fdf4' }}>
            <span style={{ fontSize: 22 }}>✓</span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, color: '#475569' }}>All clear</p>
          <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 6 }}>
            Press <kbd style={{ fontFamily: 'ui-monospace,monospace', background: '#f8fafc', padding: '1px 5px', borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 11 }}>/</kbd> to add something
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
        <div className="mt-2">
          <button
            onClick={() => setShowCompleted(v => !v)}
            className="flex items-center gap-2 transition-colors duration-100 hover:text-slate-600"
            style={{ fontSize: 12, color: '#94a3b8', padding: '6px 2px', width: '100%' }}
          >
            {showCompleted
              ? <ChevronDown  size={13} style={{ color: '#cbd5e1' }} />
              : <ChevronRight size={13} style={{ color: '#cbd5e1' }} />}
            <span style={{ fontWeight: 500 }}>{completed.length} completed</span>
          </button>

          {showCompleted && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #f1f5f9', marginTop: 4 }}>
              {completed.map((t, i) => (
                <div key={t.id} style={i > 0 ? { borderTop: '1px solid #f8fafc' } : {}}>
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
