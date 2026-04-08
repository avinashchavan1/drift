import { useState, useEffect } from 'react';
import { CheckSquare, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/auth';

// ── Shared styles ─────────────────────────────────────────
const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: 'var(--text-secondary)', marginBottom: 6,
};

const inputStyle = {
  display: 'block', width: '100%', padding: '11px 14px',
  borderRadius: 8, border: '1.5px solid var(--border)',
  background: 'var(--surface-input)', color: 'var(--text-primary)',
  fontSize: 14, fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color .15s',
};

// ── Password field with show/hide toggle ─────────────────
function PasswordInput({ value, onChange, placeholder, autoComplete, onFocus, onBlur }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        autoComplete={autoComplete}
        style={{ ...inputStyle, paddingRight: 42 }}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <button
        type="button"
        onMouseDown={e => e.preventDefault()}
        onClick={() => setShow(v => !v)}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center',
        }}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────
export default function AuthView({ addMode = false, onDone }) {
  const { login, register } = useAuth();

  // mode: 'login' | 'register' | 'forgot' | 'reset'
  const [mode,        setMode]        = useState('login');
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [resetToken,  setResetToken]  = useState('');
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [loading,     setLoading]     = useState(false);

  // Check URL for ?reset=TOKEN on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('reset');
    if (token) {
      setResetToken(token);
      setMode('reset');
      // Clean up URL without reloading
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleSubmit = async e => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        onDone?.();
      } else if (mode === 'register') {
        if (!name.trim()) { setError('Name is required'); return; }
        await register(name, email, password);
        onDone?.();

      } else if (mode === 'forgot') {
        await authApi.forgotPassword(email);
        setSuccess('If that email is registered, a reset link is on its way. Check your inbox.');

      } else if (mode === 'reset') {
        if (newPassword !== confirmPass) { setError('Passwords do not match'); return; }
        if (newPassword.length < 6)     { setError('Password must be at least 6 characters'); return; }
        await authApi.resetPassword(resetToken, newPassword);
        setSuccess('Password updated! You can now sign in.');
        setTimeout(() => { setMode('login'); setSuccess(''); }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    clearMessages();
    setPassword('');
    setNewPassword('');
    setConfirmPass('');
  };

  const titles = {
    login:    ['Sign in to your account', 'Welcome back'],
    register: ['Create your account',     'Get started for free'],
    forgot:   ['Reset your password',     'Enter your email and we\'ll send a link'],
    reset:    ['Set a new password',      'Choose a strong password'],
  };

  const [subtitle, title] = titles[mode];

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, background: 'var(--ig-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
          }}>
            <CheckSquare size={26} strokeWidth={2.5} style={{ color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Drift</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {addMode ? 'Sign in to add another account' : subtitle}
          </p>
          {addMode && (
            <button
              type="button"
              onClick={onDone}
              style={{
                marginTop: 8, background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: 'var(--text-muted)', padding: 0,
              }}
            >
              ← Cancel
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Name — register only */}
          {mode === 'register' && (
            <div>
              <label style={labelStyle}>Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name" required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                onBlur={e  => { e.target.style.borderColor = 'var(--border)'; }} />
            </div>
          )}

          {/* Email — login / register / forgot */}
          {mode !== 'reset' && (
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                onBlur={e  => { e.target.style.borderColor = 'var(--border)'; }} />
            </div>
          )}

          {/* Password — login / register */}
          {(mode === 'login' || mode === 'register') && (
            <div>
              <label style={labelStyle}>Password</label>
              <PasswordInput
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'login' ? '••••••••' : 'At least 6 characters'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                onBlur={e  => { e.target.style.borderColor = 'var(--border)'; }}
              />
              {/* Forgot password link */}
              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginTop: 6 }}>
                  <button type="button" onClick={() => switchMode('forgot')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--accent)', padding: 0, fontWeight: 500 }}>
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}

          {/* New password fields — reset mode */}
          {mode === 'reset' && (
            <>
              <div>
                <label style={labelStyle}>New password</label>
                <PasswordInput
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                  onBlur={e  => { e.target.style.borderColor = 'var(--border)'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Confirm password</label>
                <PasswordInput
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Repeat your new password"
                  autoComplete="new-password"
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                  onBlur={e  => { e.target.style.borderColor = 'var(--border)'; }}
                />
              </div>
            </>
          )}

          {/* Error / success */}
          {error && (
            <p style={{ fontSize: 13, color: 'var(--danger)', margin: '4px 0 0', padding: '8px 12px', background: 'var(--danger-bg)', borderRadius: 8 }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ fontSize: 13, color: '#22c55e', margin: '4px 0 0', padding: '8px 12px', background: 'rgba(34,197,94,0.08)', borderRadius: 8 }}>
              {success}
            </p>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            marginTop: 4, padding: '13px', borderRadius: 8, border: 'none',
            fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
            background: loading ? 'var(--surface-input)' : 'var(--ig-gradient)',
            color: loading ? 'var(--text-faint)' : '#ffffff',
            transition: 'opacity .15s',
          }}>
            {loading ? 'Please wait…' : {
              login:    'Sign in',
              register: 'Create account',
              forgot:   'Send reset link',
              reset:    'Update password',
            }[mode]}
          </button>
        </form>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          {mode === 'login' && (
            <p style={{ margin: 0 }}>
              Don't have an account?{' '}
              <button onClick={() => switchMode('register')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: 13, padding: 0 }}>
                Sign up
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p style={{ margin: 0 }}>
              Already have an account?{' '}
              <button onClick={() => switchMode('login')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: 13, padding: 0 }}>
                Sign in
              </button>
            </p>
          )}
          {(mode === 'forgot' || mode === 'reset') && (
            <p style={{ margin: 0 }}>
              <button onClick={() => switchMode('login')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: 13, padding: 0 }}>
                ← Back to sign in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
