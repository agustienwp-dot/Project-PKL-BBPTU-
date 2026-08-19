import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

let dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/projek_bbptu';

// If process.env still has the initial example password "password", sanitize it to empty password
if (dbUrl.includes('root:password@')) {
  dbUrl = dbUrl.replace('root:password@', 'root:@');
}

// Add 1-second connect_timeout so Prisma fails fast when DB server is down
if (!dbUrl.includes('connect_timeout=')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=1';
}

function createClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ['error'],
  });
}

// Reset global cached client if it failed or was created with invalid URL
if (!globalForPrisma.prisma || globalForPrisma._prismaUrl !== dbUrl) {
  globalForPrisma.prisma = createClient();
  globalForPrisma._prismaUrl = dbUrl;
}

export function isDbOffline() {
  if (global.__dbOfflineUntil && Date.now() < global.__dbOfflineUntil) {
    return true;
  }
  return false;
}

export function markDbOffline() {
  global.__dbOfflineUntil = Date.now() + 30000;
}

export function markDbOnline() {
  global.__dbOfflineUntil = 0;
}

export const prisma = globalForPrisma.prisma;

export default prisma;

