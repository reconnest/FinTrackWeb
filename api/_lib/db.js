import { createClient } from '@libsql/client';

let _client = null;
export function getDb() {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

export async function initSchema() {
  const db = getDb();
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      currency_code TEXT DEFAULT 'INR',
      country_code TEXT DEFAULT 'IN',
      created_at INTEGER DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      opening_balance REAL DEFAULT 0,
      credit_limit REAL DEFAULT 0,
      outstanding REAL DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      UNIQUE(user_id, name)
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      account TEXT NOT NULL,
      type TEXT NOT NULL,
      date INTEGER NOT NULL,
      note TEXT DEFAULT '',
      to_account TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      UNIQUE(user_id, type, name)
    );
  `);
}

export function rowToAccount(r) {
  return {
    name: r.name,
    type: r.type,
    openingBalance: Number(r.opening_balance),
    creditLimit: Number(r.credit_limit),
    outstanding: Number(r.outstanding),
  };
}

export function rowToTransaction(r) {
  return {
    id: Number(r.id),
    amount: Number(r.amount),
    category: r.category,
    account: r.account,
    type: r.type,
    date: Number(r.date),
    note: r.note || '',
    toAccount: r.to_account || '',
  };
}
