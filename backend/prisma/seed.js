const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data in reverse order of dependencies
  await prisma.auditLog.deleteMany();
  await prisma.animalMovement.deleteMany();
  await prisma.animalWeightHistory.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.buyer.deleteMany();
  await prisma.cage.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrator Peternakan',
      email: 'admin@farm.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Budi (Petugas Kandang)',
      email: 'staff@farm.com',
      password: staffPassword,
      role: 'STAFF',
    },
  });

  console.log('✅ Users created:', { admin: admin.email, staff: staff.email });

  // 2. Create Cages
  const cageA = await prisma.cage.create({
    data: {
      name: 'Kandang A (Sapi Potong)',
      type: 'Sapi',
      location: 'Blok Utara',
      capacity: 10,
      description: 'Kandang penggemukan sapi potong jantan',
      isActive: true,
    },
  });

  const cageB = await prisma.cage.create({
    data: {
      name: 'Kandang B (Kambing Etawa)',
      type: 'Kambing',
      location: 'Blok Selatan',
      capacity: 25,
      description: 'Kandang perkembangbiakan kambing etawa',
      isActive: true,
    },
  });

  const cageC = await prisma.cage.create({
    data: {
      name: 'Kandang C (Karantina)',
      type: 'Campuran',
      location: 'Blok Barat',
      capacity: 5,
      description: 'Kandang observasi kesehatan hewan baru',
      isActive: true,
    },
  });

  console.log('✅ Cages created:', [cageA.name, cageB.name, cageC.name]);

  // 3. Create Buyers
  const buyer1 = await prisma.buyer.create({
    data: {
      name: 'H. Ahmad Syarif',
      phone: '081234567890',
      address: 'Jl. Raya Bogor No. 45, Jakarta Timur',
      notes: 'Langganan hewan qurban tahunan',
    },
  });

  const buyer2 = await prisma.buyer.create({
    data: {
      name: 'PT Mitra Ternak Mandiri',
      phone: '082198765432',
      address: 'Kawasan Industri Jababeka, Cikarang',
      notes: 'Pembeli partai besar Sapi Potong',
    },
  });

  console.log('✅ Buyers created:', [buyer1.name, buyer2.name]);

  // 4. Create Animals
  const animal1 = await prisma.animal.create({
    data: {
      code: 'SP-001',
      name: 'Bima',
      type: 'Sapi',
      breed: 'Limosin',
      gender: 'Jantan',
      birthDate: new Date('2024-03-15'),
      weight: 450.5,
      healthStatus: 'Sehat',
      purchasePrice: 15000000,
      estimatedSellingPrice: 22000000,
      status: 'AVAILABLE',
      cageId: cageA.id,
      origin: 'Peternakan Boyolali',
      notes: 'Nafsu makan baik, vaksinasi lengkap',
    },
  });

  const animal2 = await prisma.animal.create({
    data: {
      code: 'SP-002',
      name: 'Bagus',
      type: 'Sapi',
      breed: 'Simental',
      gender: 'Jantan',
      birthDate: new Date('2024-01-10'),
      weight: 520.0,
      healthStatus: 'Sehat',
      purchasePrice: 17000000,
      estimatedSellingPrice: 25000000,
      status: 'SOLD',
      cageId: cageA.id,
      origin: 'Peternakan Kediri',
      notes: 'Sudah terjual untuk Qurban',
    },
  });

  const animal3 = await prisma.animal.create({
    data: {
      code: 'KB-001',
      name: 'Mambang',
      type: 'Kambing',
      breed: 'Etawa',
      gender: 'Jantan',
      birthDate: new Date('2024-06-01'),
      weight: 65.0,
      healthStatus: 'Sehat',
      purchasePrice: 3000000,
      estimatedSellingPrice: 4800000,
      status: 'AVAILABLE',
      cageId: cageB.id,
      origin: 'Lokal Kaligesing',
      notes: 'Bulu lebat, taring bagus',
    },
  });

  const animal4 = await prisma.animal.create({
    data: {
      code: 'KB-002',
      name: 'Cantik',
      type: 'Kambing',
      breed: 'Etawa',
      gender: 'Betina',
      birthDate: new Date('2024-05-20'),
      weight: 48.0,
      healthStatus: 'Sehat',
      purchasePrice: 2500000,
      estimatedSellingPrice: 3800000,
      status: 'AVAILABLE',
      cageId: cageB.id,
      origin: 'Lokal Kaligesing',
      notes: 'Indukan produktif',
    },
  });

  console.log('✅ Animals created:', [animal1.code, animal2.code, animal3.code, animal4.code]);

  // 5. Create Sale Record for animal2 (SP-002)
  const sale1 = await prisma.sale.create({
    data: {
      animalId: animal2.id,
      buyerId: buyer1.id,
      saleDate: new Date('2026-08-01'),
      weightAtSale: 520.0,
      sellingPrice: 25000000,
      paymentMethod: 'TRANSFER',
      notes: 'Lunas via Transfer BCA',
    },
  });

  console.log('✅ Sale created for animal:', animal2.code);

  // 6. Create Weight History
  await prisma.animalWeightHistory.createMany({
    data: [
      { animalId: animal1.id, weight: 420.0, recordedAt: new Date('2026-06-01'), notes: 'Berat awal masuk' },
      { animalId: animal1.id, weight: 438.0, recordedAt: new Date('2026-07-01'), notes: 'Pemeriksaan bulanan' },
      { animalId: animal1.id, weight: 450.5, recordedAt: new Date('2026-08-01'), notes: 'Penimbangan rutin' },
      { animalId: animal2.id, weight: 500.0, recordedAt: new Date('2026-06-01'), notes: 'Berat awal masuk' },
      { animalId: animal2.id, weight: 520.0, recordedAt: new Date('2026-07-25'), notes: 'Berat sebelum dijual' },
    ],
  });

  console.log('✅ Weight histories recorded');

  // 7. Create Animal Movement
  await prisma.animalMovement.create({
    data: {
      animalId: animal1.id,
      fromCageId: cageC.id,
      toCageId: cageA.id,
      movedAt: new Date('2026-06-05'),
      notes: 'Selesai masa karantina, dipindah ke Kandang A',
    },
  });

  console.log('✅ Animal movement history recorded');

  // 8. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'SEED_INITIALIZATION',
        entity: 'System',
        entityId: 'SYSTEM',
        details: 'Initial database seed executed successfully',
      },
      {
        userId: admin.id,
        action: 'CREATE_SALE',
        entity: 'Sale',
        entityId: sale1.id,
        details: `Created sale transaction for animal ${animal2.code} to ${buyer1.name}`,
      },
    ],
  });

  console.log('✅ Audit logs recorded');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
