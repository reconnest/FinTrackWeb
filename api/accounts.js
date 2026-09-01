import { getDb, rowToAccount } from './_lib/db.js';
import { withAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  return withAuth(req, res, async (user) => {
    const db = getDb();

    if (req.method === 'GET') {
      const result = await db.execute({ sql: 'SELECT * FROM accounts WHERE user_id = ? ORDER BY sort_order, id', args: [user.userId] });
      return res.json(result.rows.map(rowToAccount));
    }

    if (req.method === 'POST') {
      const { name, type, openingBalance = 0, creditLimit = 0, outstanding = 0 } = req.body;
      const count = await db.execute({ sql: 'SELECT COUNT(*) as c FROM accounts WHERE user_id = ?', args: [user.userId] });
      const sortOrder = Number(count.rows[0].c);
      await db.execute({
        sql: 'INSERT INTO accounts (user_id, name, type, opening_balance, credit_limit, outstanding, sort_order) VALUES (?,?,?,?,?,?,?)',
        args: [user.userId, name, type, openingBalance, creditLimit, outstanding, sortOrder],
      });
      return res.status(201).json({ ok: true });
    }

    res.status(405).end();
  });
}
