const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const lCount = await prisma.beritaAcaraLog.deleteMany({});
    const bCount = await prisma.beritaAcara.deleteMany({});
    const pCount = await prisma.milkProduction.deleteMany({});
    console.log('SUCCESS_CLEARED_DATABASE');
    console.log(`Deleted Logs: ${lCount.count}, BAST: ${bCount.count}, Production: ${pCount.count}`);
  } catch (err) {
    console.error('Error clearing records:', err);
  }
}

main().finally(() => prisma.$disconnect());
