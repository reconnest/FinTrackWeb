const BASE = '/api';

function getJWT() { return localStorage.getItem('fintrack_jwt'); }

async function request(method, path, body) {
  const jwt = getJWT();
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem('fintrack_jwt');
    window.location.reload();
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  signIn: (authData) => request('POST', '/auth', typeof authData === 'string' ? { credential: authData } : authData),

  // Profile
  getUser:    ()     => request('GET',  '/user'),
  updateUser: (data) => request('PUT',  '/user', data),

  // Accounts
  getAccounts:    ()              => request('GET',    '/accounts'),
  addAccount:     (acc)           => request('POST',   '/accounts', acc),
  editAccount:    (oldName, acc)  => request('PUT',    `/accounts/${encodeURIComponent(oldName)}`, acc),
  deleteAccount:  (name)          => request('DELETE', `/accounts/${encodeURIComponent(name)}`),

  // Transactions
  getTransactions:    ()       => request('GET',    '/transactions'),
  saveTransaction:    (tx)     => request('POST',   '/transactions', tx),
  deleteTransaction:  (id)     => request('DELETE', `/transactions/${id}`),
  bulkDelete:         (ids)    => request('DELETE', '/transactions?bulk=1', { ids }),

  // Categories
  getCategories:    ()                  => request('GET',    '/categories'),
  addCategory:      (type, name)        => request('POST',   '/categories', { type, name }),
  renameCategory:   (type, old, nw)     => request('PUT',    '/categories', { type, oldName: old, newName: nw }),
  deleteCategory:   (type, name)        => request('DELETE', '/categories', { type, name }),
};
