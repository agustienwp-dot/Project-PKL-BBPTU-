const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const list = await prisma.beritaAcara.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, nomorBA: true, date: true, animalType: true, farmLocation: true, createdAt: true }
  });
  console.log('DB list count:', list.length);
  console.log(JSON.stringify(list, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
