import { useMemo, useState } from 'react';
import { LogOut, Mail, User, Edit2, Check, X, UserPlus, ChevronRight, Bell, BellOff, BellRing, Send, Clock, AlertTriangle, Sun } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { getCategoryColor } from '../utils/parseInput';
import { useNotifications } from '../hooks/useNotifications';

function Avatar({ name, size = 80 }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--ig-gradient)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 4px 20px rgba(131,58,180,0.35)',
    }}>
      <span style={{ fontSize: size * 0.35, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
        {initials}
      </span>
    </div>
  );
}

function StatCard({ label, value, gradient }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: 'var(--surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 14,
      padding: '14px 10px',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: 22, fontWeight: 700, margin: '0 0 3px',
        ...(gradient ? {
          background: 'var(--ig-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        } : { color: 'var(--text-primary)' }),
      }}>
        {value}
      </p>
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-faint)', margin: 0 }}>
        {label}
      </p>
    </div>
  );
}

function NotificationSettings() {
  const { supported, permission, subscribed, prefs, loading, requestAndSubscribe, unsubscribe, updatePrefs, sendTest } = useNotifications();
  const [testSent, setTestSent] = useState(false);

  if (!supported) {
    return (
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 10 }}>Notifications</p>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <BellOff size={16} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Push notifications are not supported in this browser.</p>
        </div>
      </div>
    );
  }

  const handleToggle = async () => {
    if (subscribed) { await unsubscribe(); }
    else            { await requestAndSubscribe(prefs); }
  };

  const handleTest = async () => {
    const ok = await sendTest();
    if (ok) { setTestSent(true); setTimeout(() => setTestSent(false), 3000); }
  };

  const NOTIF_TYPES = [
    { key: 'dueSoon',       label: 'Due soon',       desc: '30 min before a task is due',       icon: Clock },
    { key: 'overdueAlerts', label: 'Overdue alerts',  desc: 'When tasks become overdue',          icon: AlertTriangle },
    { key: 'dailyDigest',   label: 'Daily digest',    desc: "8 AM summary of today's tasks",     icon: Sun },
  ];

  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 10 }}>
        Notifications
      </p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, overflow: 'hidden' }}>

        {/* Main toggle row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: subscribed ? '1px solid var(--border-subtle)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: subscribed ? 'var(--accent-bg)' : 'var(--surface-input)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {subscribed
                ? <BellRing size={16} style={{ color: 'var(--accent)' }} />
                : <Bell     size={16} style={{ color: 'var(--text-muted)' }} />}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {subscribed ? 'Notifications on' : 'Enable notifications'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {subscribed ? 'Tap to turn off' : permission === 'denied' ? 'Blocked — allow in browser settings' : 'Get reminders on any device'}
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            onClick={handleToggle}
            disabled={loading || permission === 'denied'}
            style={{
              width: 44, height: 26, borderRadius: 13, border: 'none', cursor: loading ? 'default' : 'pointer',
              background: subscribed ? 'var(--accent)' : 'var(--border)',
              position: 'relative', transition: 'background .2s', flexShrink: 0,
              opacity: permission === 'denied' ? 0.4 : 1,
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: subscribed ? 21 : 3,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
            }} />
          </button>
        </div>

        {/* Notification type checkboxes — only when subscribed */}
        {subscribed && (
          <>
            {NOTIF_TYPES.map(({ key, label, desc, icon: Icon }, i) => (
              <div
                key={key}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: i < NOTIF_TYPES.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon size={14} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '1px 0 0' }}>{desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => updatePrefs({ [key]: !prefs[key] })}
                  style={{
                    width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
                    background: prefs[key] ? 'var(--accent)' : 'var(--border)',
                    position: 'relative', transition: 'background .2s',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 2, left: prefs[key] ? 17 : 2,
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    transition: 'left .2s', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
                  }} />
                </button>
              </div>
            ))}

            {/* Test notification button */}
            <button
              onClick={handleTest}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '12px 16px',
                borderTop: '1px solid var(--border-subtle)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500,
                color: testSent ? '#22c55e' : 'var(--accent)',
              }}
            >
              {testSent
                ? <><Check size={14} /> Notification sent!</>
                : <><Send size={13} /> Send test notification</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProfileView({ onLogout, onAddAccount, onSwitchAccount }) {
  const { user, accounts, removeAccount } = useAuth();
  const otherAccounts = accounts.filter(a => a.email !== user?.email);
  const { data: tasks = [] } = useTasks();
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || '');

  const stats = useMemo(() => {
    const total     = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active    = total - completed;
    const rate      = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, rate };
  }, [tasks]);

  const topCategories = useMemo(() => {
    const counts = {};
    tasks.forEach(t => { if (t.category) counts[t.category] = (counts[t.category] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = sorted[0]?.[1] || 1;
    return sorted.map(([cat, count]) => ({ cat, count, pct: Math.round((count / max) * 100) }));
  }, [tasks]);

  const joinedDate = useMemo(() => {
    if (!tasks.length) return null;
    const oldest = tasks.reduce((min, t) =>
      new Date(t.createdAt) < new Date(min.createdAt) ? t : min, tasks[0]);
    return new Date(oldest.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [tasks]);

  return (
    <div>

      {/* Hero banner */}
      <div style={{
        height: 110, borderRadius: 20, marginBottom: 0,
        background: 'var(--ig-gradient)',
        position: 'relative', overflow: 'hidden', opacity: 0.9,
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -25, left: 50, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', top: 20, left: 20, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      </div>

      {/* Avatar + name row */}
      <div style={{ position: 'relative', padding: '0 16px', marginTop: -40, marginBottom: 24, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
        <div style={{ border: '3px solid var(--bg)', borderRadius: '50%', flexShrink: 0 }}>
          <Avatar name={user?.name} size={80} />
        </div>
        <div style={{ paddingBottom: 4, flex: 1, minWidth: 0 }}>
          {editingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                autoFocus
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter')  setEditingName(false);
                  if (e.key === 'Escape') { setNameValue(user?.name || ''); setEditingName(false); }
                }}
                style={{
                  fontSize: 18, fontWeight: 700, color: 'var(--text-primary)',
                  background: 'transparent', border: 'none', outline: 'none',
                  borderBottom: '2px solid var(--accent)', paddingBottom: 1,
                  flex: 1, minWidth: 0, fontFamily: 'inherit',
                }}
              />
              <button onClick={() => setEditingName(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 2 }}>
                <Check size={14} />
              </button>
              <button onClick={() => { setNameValue(user?.name || ''); setEditingName(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </p>
              <button
                onClick={() => setEditingName(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: 2, flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; }}
              >
                <Edit2 size={12} />
              </button>
            </div>
          )}
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        <StatCard label="Total"  value={stats.total}     />
        <StatCard label="Done"   value={stats.completed} gradient />
        <StatCard label="Active" value={stats.active}    />
        <StatCard label="Rate"   value={`${stats.rate}%`} gradient />
      </div>

      {/* Top categories */}
      {topCategories.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 12 }}>
            Top Categories
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topCategories.map(({ cat, count, pct }) => {
              const p = getCategoryColor(cat);
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: p.text }}>#{cat}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{count} task{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 9999, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      borderRadius: 9999, background: p.dot,
                      transition: 'width .6s cubic-bezier(.4,0,.2,1)',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Account info */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 10 }}>
          Account
        </p>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <User size={14} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: 'var(--text-faint)', margin: '0 0 1px' }}>Display name</p>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px' }}>
            <Mail size={14} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: 'var(--text-faint)', margin: '0 0 1px' }}>Email</p>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
          </div>
        </div>
        {joinedDate && (
          <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8, textAlign: 'center' }}>
            First task created {joinedDate}
          </p>
        )}
      </div>

      {/* Notification settings */}
      <NotificationSettings />

      {/* Account switcher */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 10 }}>
          Accounts
        </p>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, overflow: 'hidden' }}>

          {/* Current account */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: otherAccounts.length > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--ig-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                {user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} title="Active" />
          </div>

          {/* Other saved accounts */}
          {otherAccounts.map((acct, i) => (
            <div
              key={acct.email}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', cursor: 'pointer' }}
              onClick={() => onSwitchAccount?.(acct.email)}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-input)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {acct.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acct.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acct.email}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={e => { e.stopPropagation(); removeAccount(acct.email); }}
                  title="Remove account"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: 4, display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; }}
                >
                  <X size={14} />
                </button>
                <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
              </div>
            </div>
          ))}

          {/* Add account */}
          <button
            onClick={onAddAccount}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '12px 16px', borderTop: '1px solid var(--border-subtle)',
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-input)', border: '1.5px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserPlus size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Add account</span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        style={{
          width: '100%', padding: '13px',
          borderRadius: 14, border: '1px solid var(--border)',
          background: 'var(--surface)', color: 'var(--danger)',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background .15s, border-color .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <LogOut size={14} />
        Sign out
      </button>

    </div>
  );
}
