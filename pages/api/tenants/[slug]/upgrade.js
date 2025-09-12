const prisma = require('../../../../lib/prisma');
const { getUserFromReq } = require('../../../../lib/auth');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const payload = await getUserFromReq(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const slug = req.query.slug;
  if (!slug) return res.status(400).json({ error: 'Missing slug' });

  // ensure payload.tenantSlug matches slug and role is ADMIN
  if (payload.tenantSlug !== slug) return res.status(403).json({ error: 'Can only upgrade your tenant' });
  if (payload.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

  const tenant = await prisma.tenant.update({
    where: { slug },
    data: { plan: 'PRO' },
  });

  res.json({ tenant });
}
