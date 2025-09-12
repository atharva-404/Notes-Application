const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis.__prisma;

const prisma = globalForPrisma || new PrismaClient();

if (!globalForPrisma) {
  globalThis.__prisma = prisma;
}

module.exports = prisma;
