import { put } from '@vercel/blob';
export default async function handler(req, res) {
  if (!process.env.APP_PIN || req.headers['x-pin'] !== process.env.APP_PIN) return res.status(401).json({ error: 'pin' });
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const buf = Buffer.concat(chunks);
    if (!buf.length || buf.length > 4_000_000) return res.status(400).json({ error: 'file kosong/terlalu besar' });
    const b = await put('jastip/receipts/struk.jpg', buf, { access: 'public', addRandomSuffix: true, contentType: 'image/jpeg' });
    return res.status(200).json({ url: b.url });
  } catch (e) { return res.status(500).json({ error: String(e.message || e) }); }
}
