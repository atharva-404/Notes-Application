# Multi-tenant Notes SaaS - Minimal Repo

This is a minimal, ready-to-deploy Next.js app (API + frontend) implementing a multi-tenant notes SaaS with:

- Shared-schema multi-tenancy (tenantId column)
- JWT authentication
- Roles: ADMIN, MEMBER
- Free plan limit = 3 notes, Pro = unlimited
- Pre-seeded accounts: admin@acme.test, user@acme.test, admin@globex.test, user@globex.test (password: password)
- CORS enabled for all API routes
- Health endpoint: GET /api/health

## Quick start (local)

1. Install dependencies:
   ```
   npm install
   ```

2. Set environment variables:
   - Copy `.env.example` to `.env` and fill `DATABASE_URL` and `JWT_SECRET`.

3. Generate Prisma client and migrate:
   ```
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. Seed the database:
   ```
   node prisma/seed.js
   ```

5. Run the app:
   ```
   npm run dev
   ```

## Deployment

- Deploy to Vercel, set `DATABASE_URL` and `JWT_SECRET` in Vercel env vars.
- Run `npx prisma generate` and run the seed once (you can run locally against the same database).

