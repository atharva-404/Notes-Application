const prisma = require('../../../lib/prisma');
const { getUserFromReq } = require('../../../lib/auth');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = await getUserFromReq(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  const tenantId = payload.tenantId;

  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  if (note.tenantId !== tenantId) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    return res.json(note);
  }

  if (req.method === 'PUT') {
    const { title, content } = req.body || {};
    const updated = await prisma.note.update({
      where: { id },
      data: { title: title ?? note.title, content: content ?? note.content },
    });
    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    await prisma.note.delete({ where: { id } });
    return res.json({ ok: true });
  }

  res.status(405).end();
}
