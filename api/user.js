import { getDb } from './_lib/db.js';
import { withAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  return withAuth(req, res, async (user) => {
    const db = getDb();

    if (req.method === 'GET') {
      const result = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [user.userId] });
      if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
      const r = result.rows[0];
      return res.json({ id: r.id, name: r.name, email: r.email, currencyCode: r.currency_code, countryCode: r.country_code });
    }

    if (req.method === 'PUT') {
      const { name, currencyCode, countryCode } = req.body;
      await db.execute({
        sql: 'UPDATE users SET name = ?, currency_code = ?, country_code = ? WHERE id = ?',
        args: [name, currencyCode || 'INR', countryCode || 'IN', user.userId],
      });
      return res.json({ ok: true });
    }

    res.status(405).end();
  });
}
