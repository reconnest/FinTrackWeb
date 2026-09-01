import { OAuth2Client } from 'google-auth-library';
import { SignJWT } from 'jose';
import { getDb, initSchema } from './_lib/db.js';
import { cors } from './_lib/auth.js';

const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET);

const DEFAULT_INCOME  = ['Salary', 'Freelance', 'Interest', 'Bonus', 'Other'];
const DEFAULT_EXPENSE = ['Food', 'Groceries', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Utilities', 'Rent', 'Education', 'Travel', 'Subscriptions', 'Other'];

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Missing credential' });

  try {
    // 1. Verify Google ID token
    const client = new OAuth2Client(CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: CLIENT_ID });
    const { sub: userId, name, email } = ticket.getPayload();

    // 2. Init schema + get/create user
    await initSchema();
    const db = getDb();

    const existing = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] });
    const isNewUser = existing.rows.length === 0;

    if (isNewUser) {
      await db.execute({ sql: 'INSERT INTO users (id, name, email) VALUES (?, ?, ?)', args: [userId, name, email] });
      // Seed default accounts
      for (const [n, t] of [['Bank','BANK'],['Cash','CASH_WALLET']]) {
        await db.execute({ sql: 'INSERT OR IGNORE INTO accounts (user_id, name, type) VALUES (?,?,?)', args: [userId, n, t] });
      }
      // Seed default categories
      for (const c of DEFAULT_INCOME)  await db.execute({ sql: 'INSERT OR IGNORE INTO categories (user_id, type, name) VALUES (?,?,?)', args: [userId, 'income',  c] });
      for (const c of DEFAULT_EXPENSE) await db.execute({ sql: 'INSERT OR IGNORE INTO categories (user_id, type, name) VALUES (?,?,?)', args: [userId, 'expense', c] });
    }

    const userRow = (await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] })).rows[0];

    // 3. Issue JWT
    const token = await new SignJWT({ userId, email, name })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(getSecret());

    res.json({
      token,
      isNewUser,
      user: {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        currencyCode: userRow.currency_code,
        countryCode: userRow.country_code,
      },
    });
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
}
