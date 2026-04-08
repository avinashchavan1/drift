import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import TaskFormSheet from './TaskFormSheet';

export default function QuickAddInput({ onAdd }) {
  const [open, setOpen] = useState(false);

  // '/' or ⌘K / Ctrl+K opens the sheet from anywhere
  useEffect(() => {
    const handler = e => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '/') { e.preventDefault(); setOpen(true); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          width: '100%', padding: '12px 16px', marginBottom: 32,
          background: 'var(--surface)', borderRadius: 14,
          border: '1.5px solid var(--border)',
          boxShadow: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--accent-bg)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Plus size={12} strokeWidth={3} style={{ color: 'var(--accent)' }} />
        </span>

        <span style={{ flex: 1, fontSize: 14, color: 'var(--text-muted)' }}>Add a task…</span>

        <kbd style={{
          fontSize: 10, fontFamily: 'ui-monospace,monospace',
          background: 'var(--surface-input)', color: 'var(--text-faint)',
          padding: '2px 6px', borderRadius: 4,
          border: '1px solid var(--border)', flexShrink: 0,
        }}>
          /
        </kbd>
      </button>

      <TaskFormSheet isOpen={open} onClose={() => setOpen(false)} onAdd={onAdd} />
    </>
  );
}
