import { getDb } from './_lib/db.js';
import { withAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  return withAuth(req, res, async (user) => {
    const db = getDb();

    if (req.method === 'GET') {
      const result = await db.execute({
        sql: 'SELECT type, name FROM categories WHERE user_id = ? ORDER BY id',
        args: [user.userId],
      });
      const income  = result.rows.filter(r => r.type === 'income').map(r => r.name);
      const expense = result.rows.filter(r => r.type === 'expense').map(r => r.name);
      return res.json({ income, expense });
    }

    if (req.method === 'POST') {
      const { type, name } = req.body;
      await db.execute({
        sql: 'INSERT OR IGNORE INTO categories (user_id, type, name) VALUES (?,?,?)',
        args: [user.userId, type, name],
      });
      return res.status(201).json({ ok: true });
    }

    if (req.method === 'PUT') {
      // Rename: body = { type, oldName, newName }
      const { type, oldName, newName } = req.body;
      await db.execute({
        sql: 'UPDATE categories SET name = ? WHERE user_id = ? AND type = ? AND name = ?',
        args: [newName, user.userId, type, oldName],
      });
      // Also rename in transactions
      const txType = type === 'income' ? 'Income' : 'Expense';
      await db.execute({
        sql: 'UPDATE transactions SET category = ? WHERE user_id = ? AND type = ? AND category = ?',
        args: [newName, user.userId, txType, oldName],
      });
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { type, name } = req.body;
      await db.execute({
        sql: 'DELETE FROM categories WHERE user_id = ? AND type = ? AND name = ?',
        args: [user.userId, type, name],
      });
      return res.json({ ok: true });
    }

    res.status(405).end();
  });
}
