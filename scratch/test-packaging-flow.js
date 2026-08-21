const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- TESTING ADMIN PENGEMASAN WORKFLOW ---');

  // 1. Find user pengemasan
  const pengemasanUser = await prisma.user.findFirst({
    where: { role: 'ADMIN_PENGEMASAN' },
  });
  console.log('Pengemasan User:', pengemasanUser ? pengemasanUser.email : 'NOT FOUND');

  // 2. Find or create a test production
  let category = await prisma.milkCategory.findFirst();
  if (!category) {
    category = await prisma.milkCategory.create({
      data: {
        name: 'Susu Perah Segar',
        animalType: 'SAPI',
        productType: 'SEGAR',
        defaultPackaging: 'botol',
      },
    });
  }

  let adminFarm = await prisma.user.findFirst({ where: { role: 'ADMIN_FARM' } });
  if (!adminFarm) {
    adminFarm = pengemasanUser;
  }

  const prod = await prisma.milkProduction.create({
    data: {
      date: new Date(),
      categoryId: category.id,
      productType: 'SEGAR',
      animalType: 'SAPI',
      packagingType: 'botol',
      grossVolumeLiters: 100,
      pedetVolumeLiters: 10,
      afkirVolumeLiters: 0,
      usageType: 'Pedet: 10L',
      usageVolumeLiters: 10,
      rawVolumeLiters: 90,
      processedLiters: 0,
      packagedQty: 0,
      notes: 'Test produksi perah',
      createdById: adminFarm.id,
    },
  });

  console.log(`Created Production: ID ${prod.id}, Raw Net: ${prod.rawVolumeLiters} L, Processed: ${prod.processedLiters} L, Sisa: ${prod.rawVolumeLiters - prod.processedLiters} L`);

  // 3. Admin Pengemasan packages 40 Liters into 30 Botol and 20 Cup
  const bQty = 30;
  const cQty = 20;
  const pbQty = 0;
  const totalPcs = bQty + cQty + pbQty;
  const processedLiters = 40;

  const pkg = await prisma.milkPackaging.create({
    data: {
      date: new Date(),
      productionId: prod.id,
      productCategory: 'Susu',
      productSubtype: 'Susu Pasteurisasi',
      origin: 'Sapi',
      variant: 'Original',
      animalType: 'SAPI',
      categoryId: category.id,
      processedAmount: processedLiters,
      processedUnit: 'Liter',
      processedLiters: processedLiters,
      packagingType: 'Botol',
      packageSize: '250 ml',
      botolQty: bQty,
      cupQty: cQty,
      plastikBantalQty: pbQty,
      totalPackagedQty: totalPcs,
      quantitySent: totalPcs,
      quantityReceived: totalPcs,
      status: 'DITERIMA',
      notes: 'Test pengemasan',
      createdById: pengemasanUser.id,
    },
  });

  // Update production processedLiters
  const updatedProd = await prisma.milkProduction.update({
    where: { id: prod.id },
    data: {
      processedLiters: {
        increment: processedLiters,
      },
    },
  });

  const sisa = updatedProd.rawVolumeLiters - updatedProd.processedLiters;
  console.log(`Packaged ${processedLiters} L -> Total Pcs: ${totalPcs} (Status: ${pkg.status})`);
  console.log(`Updated Production: Raw Net ${updatedProd.rawVolumeLiters} L, Processed: ${updatedProd.processedLiters} L, Sisa: ${sisa} L`);

  // Clean up test data
  await prisma.milkPackaging.delete({ where: { id: pkg.id } });
  await prisma.milkProduction.delete({ where: { id: prod.id } });
  console.log('--- TEST COMPLETED SUCCESSFULLY! ---');
}

main()
  .catch((e) => {
    console.error('Test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
