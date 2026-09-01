import { getDb, rowToTransaction } from './_lib/db.js';
import { withAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  return withAuth(req, res, async (user) => {
    const db = getDb();

    if (req.method === 'GET') {
      const result = await db.execute({
        sql: 'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
        args: [user.userId],
      });
      return res.json(result.rows.map(rowToTransaction));
    }

    if (req.method === 'POST') {
      const { id, amount, category, account, type, date, note = '', toAccount = '' } = req.body;
      // Upsert — if id exists update, else insert
      await db.execute({
        sql: `INSERT INTO transactions (id, user_id, amount, category, account, type, date, note, to_account)
              VALUES (?,?,?,?,?,?,?,?,?)
              ON CONFLICT(id) DO UPDATE SET
                amount=excluded.amount, category=excluded.category, account=excluded.account,
                type=excluded.type, date=excluded.date, note=excluded.note, to_account=excluded.to_account`,
        args: [id, user.userId, amount, category, account, type, date, note, toAccount],
      });
      return res.status(201).json({ ok: true });
    }

    // Bulk delete: POST /api/transactions?bulk=1 with body { ids: [...] }
    if (req.method === 'DELETE' && req.query.bulk) {
      const { ids } = req.body;
      if (!ids?.length) return res.json({ ok: true });
      const placeholders = ids.map(() => '?').join(',');
      await db.execute({
        sql: `DELETE FROM transactions WHERE user_id = ? AND id IN (${placeholders})`,
        args: [user.userId, ...ids],
      });
      return res.json({ ok: true, deleted: ids.length });
    }

    res.status(405).end();
  });
}
