const prisma = require('../../../lib/prisma');
const { getUserFromReq } = require('../../../lib/auth');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = await getUserFromReq(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const tenantId = payload.tenantId;

  if (req.method === 'GET') {
    const notes = await prisma.note.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
    return res.json(notes);
  }

  if (req.method === 'POST') {
    const { title, content } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title required' });

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(400).json({ error: 'Tenant not found' });

    if (tenant.plan === 'FREE') {
      const count = await prisma.note.count({ where: { tenantId } });
      if (count >= 3) return res.status(403).json({ error: 'Free plan limit reached' });
    }

    const note = await prisma.note.create({
      data: { title, content: content || '', tenantId, createdBy: payload.userId },
    });
    return res.json(note);
  }

  res.status(405).end();
}
