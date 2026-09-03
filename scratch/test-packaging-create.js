const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreate() {
  try {
    console.log('Testing MilkPackaging.create...');
    const itemsList = [{ packagingType: 'Botol', size: '250 ml', quantity: 10 }];

    const packaging = await prisma.milkPackaging.create({
      data: {
        date: new Date(),
        productionId: null,
        productCategory: 'Susu',
        productSubtype: 'Susu Segar',
        origin: 'Sapi',
        variant: 'Original',
        animalType: 'SAPI',
        categoryId: null,
        processedAmount: 500,
        processedUnit: 'Liter',
        processedLiters: 500,
        packagingDetails: JSON.stringify(itemsList),
        packagingType: 'Botol',
        packageSize: '250 ml',
        botolQty: 10,
        cupQty: 0,
        plastikBantalQty: 0,
        totalPackagedQty: 10,
        quantitySent: 10,
        quantityReceived: 10,
        status: 'DITERIMA',
        notes: 'coba',
        createdById: null,
      },
      include: {
        category: true,
        production: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    console.log('SUCCESS! Created packaging:', packaging.id);
  } catch (err) {
    console.error('FAILURE! Error details:', err);
  }
}

testCreate()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
