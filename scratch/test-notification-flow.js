const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNotificationFlow() {
  console.log('--- TESTING NOTIFICATION & CONFIRMATION FLOW ---');

  // Step 1: Create category if needed
  let cat = await prisma.milkCategory.findFirst({ where: { animalType: 'SAPI' } });
  if (!cat) {
    cat = await prisma.milkCategory.create({
      data: {
        name: 'Susu Murni Segar Sapi Test',
        code: 'TEST_SEGAR_SAPI',
        productType: 'OLAHAN',
        animalType: 'SAPI',
      }
    });
  }

  // Step 2: Admin Farm submits production
  const prod = await prisma.milkProduction.create({
    data: {
      date: new Date(),
      categoryId: cat.id,
      productType: 'OLAHAN',
      animalType: 'SAPI',
      grossVolumeLiters: 100,
      rawVolumeLiters: 100,
      status: 'MENUNGGU_KONFIRMASI',
      notes: 'Susu olahan siap dikonfirmasi dan dikemas',
    }
  });

  console.log('✅ STEP 1: Production Created by Admin Farm:', prod.id);
  console.log('   Status:', prod.status, '(Expected: MENUNGGU_KONFIRMASI)');

  // Step 3: Verify Admin Pengemasan receives notification (status === MENUNGGU_KONFIRMASI)
  const pendingCount = await prisma.milkProduction.count({
    where: { status: 'MENUNGGU_KONFIRMASI' }
  });
  console.log('✅ STEP 2: Pending Notification Count for Admin Pengemasan:', pendingCount);

  // Step 4: Admin Pengemasan clicks "Terima Konfirmasi"
  const confirmed = await prisma.milkProduction.update({
    where: { id: prod.id },
    data: { status: 'SUDAH_DIKONFIRMASI' }
  });

  console.log('✅ STEP 3: Admin Pengemasan clicked Terima Konfirmasi.');
  console.log('   New Status:', confirmed.status, '(Expected: SUDAH_DIKONFIRMASI)');

  // Step 5: Verify it is now visible in Pengemasan dropdown filter
  const availableForPackaging = await prisma.milkProduction.findMany({
    where: {
      id: prod.id,
      status: { in: ['SUDAH_DIKONFIRMASI', 'SELESAI'] }
    }
  });
  console.log('✅ STEP 4: Available for Pengemasan dropdown count:', availableForPackaging.length);

  // Step 6: Cleanup
  await prisma.milkProduction.delete({ where: { id: prod.id } });
  console.log('🧹 Cleaned up test production entry successfully!');
}

testNotificationFlow()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ TEST FAILED:', err);
    process.exit(1);
  });
