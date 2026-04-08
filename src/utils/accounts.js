const KEY = 'drift_accounts';

export function getAccounts() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function saveAccount({ email, name, token }) {
  const existing = getAccounts().filter(a => a.email !== email);
  localStorage.setItem(KEY, JSON.stringify([...existing, { email, name, token }]));
}

export function removeAccount(email) {
  localStorage.setItem(KEY, JSON.stringify(getAccounts().filter(a => a.email !== email)));
}
