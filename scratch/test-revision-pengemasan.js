const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRevision() {
  console.log('--- TESTING REVISION PENGEMASAN RULES ---');

  // Test 1: Sapi with flavor (Original, Cokelat, Melon, Strawberry)
  const pkgSapi = await prisma.milkPackaging.create({
    data: {
      date: new Date(),
      productCategory: 'Susu',
      productSubtype: 'Susu Pasteurisasi',
      origin: 'Sapi',
      variant: 'Original',
      animalType: 'SAPI',
      processedAmount: 10,
      processedUnit: 'Liter',
      packagingType: 'Botol',
      totalPackagedQty: 40,
      packagingDetails: JSON.stringify([{ packagingType: 'Botol', size: '250 ml', quantity: 40 }]),
      status: 'MENUNGGU_PENERIMAAN',
    }
  });

  console.log('✅ TEST 1 SAPI SUCCESS:', pkgSapi.id, 'Status:', pkgSapi.status, 'Variant:', pkgSapi.variant);

  // Test 2: Kambing (No flavor, variant: null)
  const pkgKambing = await prisma.milkPackaging.create({
    data: {
      date: new Date(),
      productCategory: 'Susu',
      productSubtype: 'Susu Pasteurisasi',
      origin: 'Kambing',
      variant: null,
      animalType: 'KAMBING',
      processedAmount: 5,
      processedUnit: 'Liter',
      packagingType: 'Botol',
      totalPackagedQty: 20,
      packagingDetails: JSON.stringify([{ packagingType: 'Botol', size: '250 ml', quantity: 20 }]),
      status: 'MENUNGGU_PENERIMAAN',
    }
  });

  console.log('✅ TEST 2 KAMBING SUCCESS:', pkgKambing.id, 'Status:', pkgKambing.status, 'Variant:', pkgKambing.variant);

  // Clean up test entries
  await prisma.milkPackaging.deleteMany({
    where: { id: { in: [pkgSapi.id, pkgKambing.id] } }
  });
  console.log('🧹 Cleaned test entries successfully!');
}

testRevision()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ TEST FAILED:', err);
    process.exit(1);
  });
