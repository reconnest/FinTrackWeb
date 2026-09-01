import { getDb } from '../_lib/db.js';
import { withAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  return withAuth(req, res, async (user) => {
    const db = getDb();
    const id = Number(req.query.id);

    if (req.method === 'DELETE') {
      await db.execute({
        sql: 'DELETE FROM transactions WHERE user_id = ? AND id = ?',
        args: [user.userId, id],
      });
      return res.json({ ok: true });
    }

    res.status(405).end();
  });
}
