import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { getAccounts, saveAccount, removeAccount as removeStoredAccount } from '../utils/accounts';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [accounts, setAccounts] = useState(() => getAccounts());

  // On mount — verify stored token is still valid, and register in accounts list
  useEffect(() => {
    const token = localStorage.getItem('drift_token');
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then(u => {
        setUser(u);
        saveAccount({ email: u.email, name: u.name, token });
        setAccounts(getAccounts());
      })
      .catch(() => {
        localStorage.removeItem('drift_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const _saveAndSwitch = useCallback((token, userObj) => {
    localStorage.setItem('drift_token', token);
    saveAccount({ email: userObj.email, name: userObj.name, token });
    setAccounts(getAccounts());
    setUser(userObj);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    _saveAndSwitch(res.token, res.user);
    return res.user;
  }, [_saveAndSwitch]);

  const register = useCallback(async (name, email, password) => {
    const res = await authApi.register(name, email, password);
    _saveAndSwitch(res.token, res.user);
    return res.user;
  }, [_saveAndSwitch]);

  const logout = useCallback(() => {
    if (user) removeStoredAccount(user.email);
    const remaining = getAccounts();
    if (remaining.length > 0) {
      const next = remaining[remaining.length - 1];
      localStorage.setItem('drift_token', next.token);
      setAccounts(remaining);
      // Verify the token for the next account
      authApi.me().then(u => setUser(u)).catch(() => {
        localStorage.removeItem('drift_token');
        setUser(null);
        setAccounts([]);
      });
    } else {
      localStorage.removeItem('drift_token');
      setUser(null);
      setAccounts([]);
    }
  }, [user]);

  const switchAccount = useCallback((email) => {
    const acct = getAccounts().find(a => a.email === email);
    if (!acct) return;
    localStorage.setItem('drift_token', acct.token);
    // Verify token and load user
    authApi.me().then(u => setUser(u)).catch(() => {
      // Token expired — remove this account
      removeStoredAccount(email);
      setAccounts(getAccounts());
    });
  }, []);

  const removeAccount = useCallback((email) => {
    removeStoredAccount(email);
    const remaining = getAccounts();
    setAccounts(remaining);
    if (user?.email === email) {
      if (remaining.length > 0) {
        switchAccount(remaining[remaining.length - 1].email);
      } else {
        localStorage.removeItem('drift_token');
        setUser(null);
      }
    }
  }, [user, switchAccount]);

  return (
    <AuthContext.Provider value={{ user, loading, accounts, login, register, logout, switchAccount, removeAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
