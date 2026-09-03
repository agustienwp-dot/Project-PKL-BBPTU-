const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const packagings = await prisma.milkPackaging.findMany();
    console.log('MilkPackagings count:', packagings.length);
    if (packagings.length > 0) {
      console.log('Sample packaging:', packagings[0]);
    }

    const productions = await prisma.milkProduction.findMany();
    console.log('MilkProductions count:', productions.length);
    if (productions.length > 0) {
      console.log('Sample production:', productions[0]);
    }

    const outflows = await prisma.milkOutflow.findMany();
    console.log('MilkOutflows count:', outflows.length);

    const sales = await prisma.milkSale.findMany();
    console.log('MilkSales count:', sales.length);
  } catch (e) {
    console.error('Error checking db:', e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
