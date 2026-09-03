const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTwoStepFlow() {
  console.log('--- TESTING SATU PINTU INPUTAN (2-STEP MODAL) ---');

  // Test creating packaging entry under "Susu Olahan" category
  const pkg = await prisma.milkPackaging.create({
    data: {
      date: new Date(),
      productCategory: 'Susu',
      productSubtype: 'Susu Pasteurisasi',
      origin: 'Sapi',
      variant: 'Original',
      animalType: 'SAPI',
      processedAmount: 15,
      processedUnit: 'Liter',
      packagingType: 'Botol',
      totalPackagedQty: 60,
      packagingDetails: JSON.stringify([{ packagingType: 'Botol', size: '250 ml', quantity: 60 }]),
      status: 'MENUNGGU_PENERIMAAN',
    }
  });

  console.log('✅ Created packaging entry ID:', pkg.id);
  console.log('   Category:', pkg.productCategory);
  console.log('   Subtype:', pkg.productSubtype);
  console.log('   Status:', pkg.status);

  // Clean up
  await prisma.milkPackaging.delete({ where: { id: pkg.id } });
  console.log('🧹 Cleaned up test entry successfully!');
}

testTwoStepFlow()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ TEST FAILED:', err);
    process.exit(1);
  });
