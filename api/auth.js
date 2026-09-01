import { OAuth2Client } from 'google-auth-library';
import { SignJWT } from 'jose';
import { getDb, initSchema } from './_lib/db.js';
import { cors } from './_lib/auth.js';

const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '444915871839-9ehjpvt154q3v1cfho58rfgeujlai70j.apps.googleusercontent.com';
const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET);

const DEFAULT_INCOME  = ['Salary', 'Freelance', 'Interest', 'Bonus', 'Other'];
const DEFAULT_EXPENSE = ['Food', 'Groceries', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Utilities', 'Rent', 'Education', 'Travel', 'Subscriptions', 'Other'];

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { credential, access_token } = req.body || {};
  if (!credential && !access_token) {
    return res.status(400).json({ error: 'Missing credential or access_token' });
  }

  try {
    let userId, name, email;

    // 1. Verify either ID token (credential) or Access Token (Google UserInfo)
    if (credential) {
      const client = new OAuth2Client(CLIENT_ID);
      const ticket = await client.verifyIdToken({ idToken: credential, audience: CLIENT_ID });
      const payload = ticket.getPayload();
      userId = payload.sub;
      name = payload.name;
      email = payload.email;
    } else if (access_token) {
      const gRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      if (!gRes.ok) throw new Error('Failed to verify access token with Google');
      const payload = await gRes.json();
      userId = payload.sub;
      name = payload.name;
      email = payload.email;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Invalid Google authentication' });
    }

    // 2. Init schema + get/create user
    await initSchema();
    const db = getDb();

    const existing = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] });
    const isNewUser = existing.rows.length === 0;

    if (isNewUser) {
      await db.execute({ sql: 'INSERT INTO users (id, name, email) VALUES (?, ?, ?)', args: [userId, name || 'User', email || ''] });
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
    const token = await new SignJWT({ userId, email: userRow.email, name: userRow.name })
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
