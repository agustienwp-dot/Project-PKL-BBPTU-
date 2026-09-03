const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing categories...');
    const cat = await prisma.milkCategory.findMany();
    console.log('Categories count:', cat.length);

    console.log('Testing packaging...');
    const pkg = await prisma.milkPackaging.findMany({ take: 5 });
    console.log('Packaging count:', pkg.length);

    console.log('Testing production...');
    const prod = await prisma.milkProduction.findMany({ take: 5 });
    console.log('Production count:', prod.length);

    console.log('Testing sales...');
    const sales = await prisma.milkSale.findMany({ take: 5 });
    console.log('Sales count:', sales.length);

    console.log('Testing outflows...');
    const outflows = await prisma.milkOutflow.findMany({ take: 5 });
    console.log('Outflows count:', outflows.length);

    console.log('Testing beritaAcara...');
    if (prisma.beritaAcara) {
      const ba = await prisma.beritaAcara.findMany({ take: 5 });
      console.log('BA count:', ba.length);
    }

    console.log('ALL PRISMA TEST PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('PRISMA TEST FAILED WITH ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
