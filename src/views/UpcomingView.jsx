import { useMemo } from 'react';
import {
  isTomorrow, startOfDay, format,
  isThisWeek, startOfWeek, addWeeks, addDays,
  differenceInCalendarDays,
} from 'date-fns';
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

function daysFromNow(date) {
  const d = differenceInCalendarDays(date, startOfDay(new Date()));
  if (d === 1) return 'tomorrow';
  if (d <= 7)  return `in ${d} days`;
  if (d <= 14) return 'next week';
  return `in ${Math.round(d / 7)} weeks`;
}

// Week strip — next 7 days starting tomorrow
function WeekStrip({ tasksByDay }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfDay(new Date()), i + 1);
    const key  = format(date, 'yyyy-MM-dd');
    const count = tasksByDay[key] || 0;
    return { date, key, count, dayLetter: format(date, 'EEEEE'), dayNum: format(date, 'd') };
  });

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '16px 12px', marginBottom: 28,
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 12, textAlign: 'center' }}>
        Next 7 days
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {days.map(({ key, count, dayLetter, dayNum }) => (
          <div key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
              {dayLetter}
            </span>
            <span style={{
              width: 30, height: 30, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: count > 0 ? 700 : 400,
              background: count > 0 ? 'var(--ig-gradient)' : 'transparent',
              color: count > 0 ? '#fff' : 'var(--text-muted)',
            }}>
              {dayNum}
            </span>
            <span style={{ fontSize: 10, color: count > 0 ? 'var(--accent)' : 'transparent', fontWeight: 600 }}>
              {count > 0 ? count : '·'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UpcomingView({ categoryFilter, onCategoryClick }) {
  const { data: tasks = [] } = useTasks();
  const addTask        = useAddTask();
  const completeTask   = useCompleteTask();
  const uncompleteTask = useUncompleteTask();
  const deleteTask     = useDeleteTask();
  const updateTask     = useUpdateTask();

  const today = startOfDay(new Date());

  const upcomingTasks = useMemo(() => {
    let t = tasks.filter(t => !t.completed && t.dueDate && startOfDay(new Date(t.dueDate)) > today);
    return categoryFilter ? t.filter(t => t.category === categoryFilter) : t;
  }, [tasks, categoryFilter]);

  const noDateTasks = useMemo(() =>
    tasks.filter(t => !t.completed && !t.dueDate), [tasks]);

  const groups = useMemo(() => groupByDate(upcomingTasks), [upcomingTasks]);

  // Build a day→count map for the week strip
  const tasksByDay = useMemo(() => {
    const map = {};
    upcomingTasks.forEach(t => {
      const key = format(startOfDay(new Date(t.dueDate)), 'yyyy-MM-dd');
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [upcomingTasks]);

  const itemProps = {
    onComplete:   id   => completeTask.mutate(id),
    onUncomplete: id   => uncompleteTask.mutate(id),
    onDelete:     id   => deleteTask.mutate(id),
    onUpdate:     data => updateTask.mutate(data),
    onCategoryClick,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
          Upcoming
        </h1>
        <p style={{ marginTop: 4, fontSize: 13, color: 'var(--text-muted)' }}>
          {upcomingTasks.length > 0
            ? `${upcomingTasks.length} task${upcomingTasks.length !== 1 ? 's' : ''} scheduled`
            : 'Tasks with a future due date appear here'}
          {categoryFilter && <span style={{ color: 'var(--accent)' }}>&ensp;· #{categoryFilter}</span>}
        </p>
      </div>

      {/* Week strip */}
      <WeekStrip tasksByDay={tasksByDay} />

      {/* Quick add */}
      <div style={{ marginBottom: 28 }}>
        <QuickAddInput onAdd={d => addTask.mutate(d)} />
        <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8, textAlign: 'center' }}>
          Tip: type <strong style={{ color: 'var(--text-muted)' }}>"dentist Friday"</strong> or <strong style={{ color: 'var(--text-muted)' }}>"report next week"</strong> to auto-schedule
        </p>
      </div>

      {/* Empty state */}
      {groups.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0 16px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Nothing scheduled yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.6 }}>
            Add a task with a future date above.<br />Dates further than today show up here.
          </p>
        </div>
      )}

      {/* Date groups */}
      {groups.map(({ date, tasks: groupTasks }) => {
        const label   = dateLabel(date);
        const context = daysFromNow(date);
        const isNear  = differenceInCalendarDays(date, today) <= 2;
        return (
          <section key={date.toISOString()} style={{ marginBottom: 28 }}>
            {/* Date header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: isNear ? 'var(--ig-gradient)' : 'var(--surface-input)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: isNear ? 'rgba(255,255,255,0.8)' : 'var(--text-faint)', lineHeight: 1, letterSpacing: '0.04em' }}>
                  {format(date, 'MMM')}
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: isNear ? '#fff' : 'var(--text-secondary)', lineHeight: 1 }}>
                  {format(date, 'd')}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 11, color: 'var(--text-faint)', margin: 0 }}>{context} · {groupTasks.length} task{groupTasks.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Task list */}
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
              {groupTasks
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .map((t, i) => (
                  <div key={t.id} style={i > 0 ? { borderTop: '1px solid var(--border-subtle)' } : {}}>
                    <TaskItem task={t} {...itemProps} />
                  </div>
                ))}
            </div>
          </section>
        );
      })}

      {/* Unscheduled callout */}
      {noDateTasks.length > 0 && (
        <div style={{
          marginTop: 8, padding: '12px 16px', borderRadius: 12,
          background: 'var(--surface)', border: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>📋</span>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>{noDateTasks.length} task{noDateTasks.length !== 1 ? 's' : ''}</strong> with no due date —
            {' '}open <strong style={{ color: 'var(--text-secondary)' }}>Today</strong> to schedule them
          </p>
        </div>
      )}
    </div>
  );
}
