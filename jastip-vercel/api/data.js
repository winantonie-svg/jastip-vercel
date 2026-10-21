import { put, head } from '@vercel/blob';
import crypto from 'crypto';
const name = () => 'jastip/data-' + crypto.createHash('sha256').update('jt' + (process.env.APP_PIN || '')).digest('hex').slice(0, 20) + '.json';
export default async function handler(req, res) {
  if (!process.env.APP_PIN || req.headers['x-pin'] !== process.env.APP_PIN) return res.status(401).json({ error: 'pin' });
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      let h;
      try { h = await head(name()); } catch (e) { if (e.name === 'BlobNotFoundError') return res.status(200).json({ items: null }); throw e; }
      const r = await fetch(h.url + '?t=' + Date.now(), { cache: 'no-store' });
      return res.status(200).json(await r.json());
    }
    if (req.method === 'PUT') {
      const b = req.body;
      if (!b || !Array.isArray(b.items)) return res.status(400).json({ error: 'bad body' });
      await put(name(), JSON.stringify(b), { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 60 });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).end();
  } catch (e) { return res.status(500).json({ error: String(e.message || e) }); }
}
