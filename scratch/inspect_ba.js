const { PrismaClient } = require('D:/BBPTUHPT/Project-PKL-BBPTU-/lib/prisma-client');
const prisma = new PrismaClient();

async function main() {
  const baList = await prisma.beritaAcara.findMany({
    orderBy: { createdAt: 'desc' },
    include: { production: true }
  });
  console.log('Total beritaAcara records:', baList.length);
  for (const b of baList) {
    console.log(`- ID: ${b.id}, No: ${b.nomorBA}, Type: ${b.type}, Farm: ${b.farmLocation}, Date: ${b.date?.toISOString?.().slice(0,10)}, Vol: ${b.diserahterimakan}, Status: ${b.status}, Penyerah: ${b.penyerahName}, Penerima: ${b.penerimaName}`);
  }
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
  process.exit(0);
});
