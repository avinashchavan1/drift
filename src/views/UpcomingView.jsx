import { useMemo } from 'react';
import { isTomorrow, startOfDay, format, isThisWeek, startOfWeek, addWeeks } from 'date-fns';
import QuickAddInput from '../components/QuickAddInput';
import TaskItem from '../components/TaskItem';
import {
  useTasks, useAddTask, useCompleteTask,
  useUncompleteTask, useDeleteTask, useUpdateTask,
} from '../hooks/useTasks';

function isNextWeek(date) {
  const s = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 });
  return date >= s && date < addWeeks(s, 1);
}

function groupByDate(tasks) {
  const map = {};
  tasks.forEach(task => {
    if (!task.dueDate) return;
    const key = format(startOfDay(new Date(task.dueDate)), 'yyyy-MM-dd');
    if (!map[key]) map[key] = { date: startOfDay(new Date(task.dueDate)), tasks: [] };
    map[key].tasks.push(task);
  });
  return Object.values(map).sort((a, b) => a.date - b.date);
}

function dateLabel(date) {
  if (isTomorrow(date))                      return 'Tomorrow';
  if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, 'EEEE');
  if (isNextWeek(date))                      return `Next ${format(date, 'EEEE')}`;
  return format(date, 'MMMM d, yyyy');
}

export default function UpcomingView({ categoryFilter, onCategoryClick }) {
  const { data: tasks = [] } = useTasks();
  const addTask        = useAddTask();
  const completeTask   = useCompleteTask();
  const uncompleteTask = useUncompleteTask();
  const deleteTask     = useDeleteTask();
  const updateTask     = useUpdateTask();

  const upcomingTasks = useMemo(() => {
    const today = startOfDay(new Date());
    let t = tasks.filter(t => !t.completed && t.dueDate && startOfDay(new Date(t.dueDate)) > today);
    return categoryFilter ? t.filter(t => t.category === categoryFilter) : t;
  }, [tasks, categoryFilter]);

  const groups = useMemo(() => groupByDate(upcomingTasks), [upcomingTasks]);

  const itemProps = {
    onComplete:   id   => completeTask.mutate(id),
    onUncomplete: id   => uncompleteTask.mutate(id),
    onDelete:     id   => deleteTask.mutate(id),
    onUpdate:     data => updateTask.mutate(data),
    onCategoryClick,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-semibold tracking-tight text-slate-900" style={{ fontSize: 26 }}>Upcoming</h1>
        <p className="mt-1" style={{ fontSize: 13, color: '#94a3b8' }}>
          {upcomingTasks.length > 0
            ? `${upcomingTasks.length} task${upcomingTasks.length !== 1 ? 's' : ''} scheduled`
            : 'Nothing scheduled'}
          {categoryFilter && <span style={{ color: '#3b82f6' }}>&ensp;· #{categoryFilter}</span>}
        </p>
      </div>

      <QuickAddInput onAdd={d => addTask.mutate(d)} />

      {groups.length === 0 && (
        <div className="text-center" style={{ paddingTop: 64 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
          <p style={{ fontSize: 15, fontWeight: 500, color: '#475569' }}>Nothing coming up</p>
          <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 6 }}>
            Try "dentist Friday" or "report next week"
          </p>
        </div>
      )}

      {groups.map(({ date, tasks: groupTasks }) => (
        <section key={date.toISOString()} className="mb-8">
          {/* Date header */}
          <div className="flex items-baseline gap-2.5 mb-1" style={{ paddingLeft: 2 }}>
            <span className="font-semibold text-slate-800" style={{ fontSize: 13 }}>
              {dateLabel(date)}
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{format(date, 'MMM d')}</span>
            <span className="ml-auto" style={{ fontSize: 11, color: '#cbd5e1' }}>{groupTasks.length}</span>
          </div>

          {/* Task list */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #f1f5f9' }}>
            {groupTasks
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .map((t, i, arr) => (
                <div key={t.id} style={i > 0 ? { borderTop: '1px solid #f8fafc' } : {}}>
                  <TaskItem task={t} {...itemProps} />
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
