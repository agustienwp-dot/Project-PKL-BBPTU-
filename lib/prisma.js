import { PrismaClient } from './prisma-client';

const globalForPrisma = global;

let dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/projek_bbptu';

// If process.env still has the initial example password "password", sanitize it to empty password
if (dbUrl.includes('root:password@')) {
  dbUrl = dbUrl.replace('root:password@', 'root:@');
}

function createClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ['query', 'info', 'warn', 'error'],
  });
}

// Reset global cached client if it failed or was created with invalid URL
if (!globalForPrisma.prisma || globalForPrisma._prismaUrl !== dbUrl) {
  globalForPrisma.prisma = createClient();
  globalForPrisma._prismaUrl = dbUrl;
}

export const prisma = globalForPrisma.prisma;

export default prisma;
