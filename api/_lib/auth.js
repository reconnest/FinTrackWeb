import { jwtVerify } from 'jose';

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET);

export async function verifyJWT(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  if (!header.startsWith('Bearer ')) throw new Error('No token');
  const token = header.slice(7);
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
}

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

export async function withAuth(req, res, handler) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const user = await verifyJWT(req);
    return handler(user);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
