const { PrismaClient } = require('D:/BBPTUHPT/Project-PKL-BBPTU-/lib/prisma-client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res1 = await prisma.beritaAcara.findMany();
    console.log('prisma.beritaAcara.findMany worked, count:', res1.length);
  } catch (e) {
    console.log('prisma.beritaAcara error:', e.message);
  }

  try {
    const res2 = await prisma.bastDocument.findMany();
    console.log('prisma.bastDocument.findMany worked, count:', res2.length);
  } catch (e) {
    console.log('prisma.bastDocument error:', e.message);
  }
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
  process.exit(0);
});
