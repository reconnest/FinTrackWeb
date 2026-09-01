import { getDb } from '../_lib/db.js';
import { withAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  return withAuth(req, res, async (user) => {
    const db  = getDb();
    const old = decodeURIComponent(req.query.name);

    if (req.method === 'PUT') {
      const { name, type, openingBalance = 0, creditLimit = 0, outstanding = 0 } = req.body;
      await db.execute({
        sql: 'UPDATE accounts SET name=?, type=?, opening_balance=?, credit_limit=?, outstanding=? WHERE user_id=? AND name=?',
        args: [name, type, openingBalance, creditLimit, outstanding, user.userId, old],
      });
      // Rename in transactions if name changed
      if (name !== old) {
        await db.execute({ sql: 'UPDATE transactions SET account   = ? WHERE user_id = ? AND account   = ?', args: [name, user.userId, old] });
        await db.execute({ sql: 'UPDATE transactions SET to_account= ? WHERE user_id = ? AND to_account= ?', args: [name, user.userId, old] });
      }
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await db.execute({ sql: 'DELETE FROM accounts     WHERE user_id = ? AND name = ?',    args: [user.userId, old] });
      await db.execute({ sql: 'DELETE FROM transactions WHERE user_id = ? AND account = ?', args: [user.userId, old] });
      return res.json({ ok: true });
    }

    res.status(405).end();
  });
}
