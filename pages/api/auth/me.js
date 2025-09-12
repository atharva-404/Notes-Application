const prisma = require('../../../lib/prisma');
const { getUserFromReq } = require('../../../lib/auth');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = await getUserFromReq(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { tenant: true } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    tenant: { id: user.tenant.id, slug: user.tenant.slug, name: user.tenant.name, plan: user.tenant.plan }
  });
}
