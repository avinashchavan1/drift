import { useMemo, useState } from 'react';
import { Check, Zap, ArrowRight } from 'lucide-react';
import DateBadge from '../components/DateBadge';
import CategoryChip from '../components/CategoryChip';
import { useTasks, useCompleteTask } from '../hooks/useTasks';

export default function FocusView({ onCategoryClick }) {
  const { data: tasks = [] }    = useTasks();
  const completeTask            = useCompleteTask();
  const [completingId, setId]   = useState(null);
  const [session, setSession]   = useState(false);

  const top3 = useMemo(() => {
    const active   = tasks.filter(t => !t.completed);
    const withDate = active.filter(t =>  t.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const noDate   = active.filter(t => !t.dueDate).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return [...withDate, ...noDate].slice(0, 3);
  }, [tasks]);

  const handleComplete = id => {
    setId(id);
    setTimeout(() => { completeTask.mutate(id); setId(null); }, 220);
  };

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Header */}
        <div className="text-center" style={{ marginBottom: 40 }}>
          <div className="inline-flex items-center gap-1.5 rounded-full mb-4"
            style={{ background: '#eff6ff', color: '#3b82f6', padding: '6px 14px' }}>
            <Zap size={12} fill="currentColor" />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Focus Mode</span>
          </div>
          <h1 className="font-semibold tracking-tight text-slate-900" style={{ fontSize: 28, lineHeight: 1.2, marginBottom: 8 }}>
            {top3.length > 0 ? 'Top priorities' : 'All done!'}
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            {top3.length > 0
              ? 'Focus here. Everything else can wait.'
              : 'Nothing left to do. Great work 🎉'}
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
          {top3.map((task, i) => (
            <div
              key={task.id}
              style={{
                opacity: completingId === task.id ? 0 : 1,
                transform: completingId === task.id ? 'scale(0.97)' : 'scale(1)',
                transition: 'opacity .2s, transform .2s',
              }}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  border: i === 0 ? '1.5px solid #bfdbfe' : '1.5px solid #f1f5f9',
                  boxShadow: i === 0 ? '0 2px 12px rgba(59,130,246,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                }}
              >
                {/* Rank badge */}
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, marginTop: 1,
                  background: i === 0 ? '#3b82f6' : '#f1f5f9',
                  color:      i === 0 ? '#fff'    : '#94a3b8',
                }}>
                  {i + 1}
                </span>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1e293b', lineHeight: 1.4, marginBottom: 8 }}>
                    {task.title}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {task.dueDate  && <DateBadge dueDate={task.dueDate} />}
                    {task.category && <CategoryChip category={task.category} onClick={() => onCategoryClick?.(task.category)} />}
                  </div>
                </div>

                {/* Complete button */}
                <button
                  onClick={() => handleComplete(task.id)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    border: '2px solid #e2e8f0', background: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color .15s, background .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.background = '#eff6ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
                >
                  <Check size={13} strokeWidth={3} style={{ color: '#cbd5e1' }} />
                </button>
              </div>
            </div>
          ))}

          {top3.length === 0 && (
            <div className="text-center" style={{ padding: '32px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <p style={{ fontSize: 15, fontWeight: 500, color: '#475569' }}>You're all caught up!</p>
            </div>
          )}
        </div>

        {/* Session button */}
        {top3.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => setSession(v => !v)}
              className="inline-flex items-center gap-2 transition-all duration-200"
              style={{
                padding: '10px 24px', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: session ? '#3b82f6' : '#fff',
                color:      session ? '#fff'    : '#475569',
                border:     session ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
                boxShadow:  session ? '0 4px 12px rgba(59,130,246,0.2)' : '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              {session ? (
                <><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.8)' }} /> Session active</>
              ) : (
                <>Start Focus Session <ArrowRight size={13} /></>
              )}
            </button>
            {session && (
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>
                Close other tabs. Do the work.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
