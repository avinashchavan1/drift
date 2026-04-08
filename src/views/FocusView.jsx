import { useMemo, useState, useEffect, useCallback } from 'react';
import { Check, Zap, Play, Pause, RotateCcw, Flag } from 'lucide-react';

const PRIORITY_COLOR = { high: '#E1306C', medium: '#FCAF45', low: '#405DE6' };
import DateBadge from '../components/DateBadge';
import CategoryChip from '../components/CategoryChip';
import { useTasks, useCompleteTask } from '../hooks/useTasks';

const POMODORO = 25 * 60; // 25 minutes in seconds

function pad(n) { return String(n).padStart(2, '0'); }

export default function FocusView({ onCategoryClick, onViewChange }) {
  const { data: tasks = [] } = useTasks();
  const completeTask         = useCompleteTask();
  const [completingId, setId] = useState(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState(POMODORO);
  const [running,  setRunning]  = useState(false);

  useEffect(() => {
    if (!running || timeLeft === 0) return;
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft]);

  const reset = useCallback(() => { setRunning(false); setTimeLeft(POMODORO); }, []);

  const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };
  const byPriority = (a, b) => (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0);

  const top3 = useMemo(() => {
    const active   = tasks.filter(t => !t.completed);
    const withDate = active.filter(t =>  t.dueDate).sort((a, b) => byPriority(a, b) || new Date(a.dueDate) - new Date(b.dueDate));
    const noDate   = active.filter(t => !t.dueDate).sort((a, b) => byPriority(a, b) || new Date(b.createdAt) - new Date(a.createdAt));
    return [...withDate, ...noDate].slice(0, 3);
  }, [tasks]);

  const remaining = tasks.filter(t => !t.completed).length - top3.length;

  const handleComplete = id => {
    setId(id);
    setTimeout(() => { completeTask.mutate(id); setId(null); }, 220);
  };

  const mins    = Math.floor(timeLeft / 60);
  const secs    = timeLeft % 60;
  const isDone  = timeLeft === 0;
  const pct     = Math.round(((POMODORO - timeLeft) / POMODORO) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          borderRadius: 9999, marginBottom: 12,
          background: 'var(--ig-gradient)', color: '#fff',
          padding: '6px 14px',
        }}>
          <Zap size={12} fill="currentColor" />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Focus Mode</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6, color: 'var(--text-primary)' }}>
          {top3.length > 0 ? 'Your top priorities' : 'Nothing to focus on'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {top3.length > 0
            ? 'Work through these one at a time. Start with #1.'
            : 'Add some tasks and come back here to focus.'}
        </p>
      </div>

      {/* Task cards */}
      {top3.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {top3.map((task, i) => (
            <div
              key={task.id}
              style={{
                opacity: completingId === task.id ? 0 : 1,
                transform: completingId === task.id ? 'translateX(40px)' : 'none',
                transition: 'opacity .2s, transform .2s',
              }}
            >
              <div style={{
                background: 'var(--surface)',
                borderRadius: 16,
                border: i === 0 ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                boxShadow: i === 0 ? '0 2px 12px rgba(0,149,246,0.08)' : 'none',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}>
                {/* Rank */}
                <span style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, marginTop: 1,
                  background: i === 0 ? 'var(--ig-gradient)' : 'var(--surface-input)',
                  color: i === 0 ? '#fff' : 'var(--text-muted)',
                }}>
                  {i + 1}
                </span>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: i === 0 ? 15 : 14,
                    fontWeight: i === 0 ? 600 : 500,
                    color: 'var(--text-primary)',
                    lineHeight: 1.4, marginBottom: task.dueDate || task.category ? 7 : 0,
                  }}>
                    {task.title}
                  </p>
                  {(task.dueDate || task.category) && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {task.priority && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, color: PRIORITY_COLOR[task.priority] }}>
                          <Flag size={10} fill="currentColor" />
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      )}
                      {task.dueDate  && <DateBadge dueDate={task.dueDate} />}
                      {task.category && <CategoryChip category={task.category} onClick={() => onCategoryClick?.(task.category)} />}
                    </div>
                  )}
                </div>

                {/* Complete */}
                <button
                  onClick={() => handleComplete(task.id)}
                  title="Mark done"
                  style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    border: '2px solid var(--border-strong)', background: 'var(--surface)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color .15s, background .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--surface)'; }}
                >
                  <Check size={13} strokeWidth={3} style={{ color: 'var(--text-faint)' }} />
                </button>
              </div>
            </div>
          ))}

          {remaining > 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center', marginTop: 4 }}>
              +{remaining} more task{remaining !== 1 ? 's' : ''} waiting
            </p>
          )}
        </div>
      ) : (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>All caught up!</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>No active tasks. Add something to work on.</p>
          {onViewChange && (
            <button
              onClick={() => onViewChange('today')}
              style={{
                padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: 'var(--ig-gradient)', color: '#fff', border: 'none', cursor: 'pointer',
              }}
            >
              Go to Today
            </button>
          )}
        </div>
      )}

      {/* Pomodoro Timer */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '24px 20px', textAlign: 'center',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 14 }}>
          Pomodoro Timer · 25 min
        </p>

        {/* Countdown */}
        <div style={{
          fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
          marginBottom: 6,
          ...(isDone ? {
            background: 'var(--ig-gradient)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          } : { color: 'var(--text-primary)' }),
        }}>
          {pad(mins)}:{pad(secs)}
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, borderRadius: 9999, background: 'var(--border-subtle)', marginBottom: 20, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 9999,
            background: isDone ? 'var(--ig-gradient)' : 'var(--accent)',
            transition: 'width 1s linear',
          }} />
        </div>

        {isDone ? (
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 14 }}>
              Session complete! Take a 5 min break.
            </p>
            <button
              onClick={reset}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: 'var(--ig-gradient)', color: '#fff', border: 'none', cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} /> New session
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <button
              onClick={() => setRunning(r => !r)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: running ? 'var(--surface-input)' : 'var(--ig-gradient)',
                color: running ? 'var(--text-secondary)' : '#fff',
                border: running ? '1.5px solid var(--border)' : 'none',
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              {running ? <><Pause size={13} fill="currentColor" /> Pause</> : <><Play size={13} fill="currentColor" /> Start</>}
            </button>
            {timeLeft < POMODORO && (
              <button
                onClick={reset}
                style={{
                  width: 38, height: 38, borderRadius: '50%', border: '1.5px solid var(--border)',
                  background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        )}

        {running && !isDone && (
          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 14 }}>
            Stay focused. No switching tabs. 🎯
          </p>
        )}
      </div>

    </div>
  );
}
