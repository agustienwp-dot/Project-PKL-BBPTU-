const { PrismaClient } = require('D:/BBPTUHPT/Project-PKL-BBPTU-/lib/prisma-client');
const prisma = new PrismaClient();

async function checkProds() {
  const prods = await prisma.milkProduction.findMany();
  console.log('Total MilkProduction in DB:', prods.length);
  for (const p of prods) {
    console.log({
      id: p.id,
      date: p.date,
      farmOrigin: p.farmOrigin,
      animalType: p.animalType,
      shift: p.shift,
      grossVolumeLiters: p.grossVolumeLiters,
      rawVolumeLiters: p.rawVolumeLiters,
      pedetVolumeLiters: p.pedetVolumeLiters,
      afkirVolumeLiters: p.afkirVolumeLiters,
    });
  }
}

checkProds().finally(() => {
  prisma.$disconnect();
  process.exit(0);
});
