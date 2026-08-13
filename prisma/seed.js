const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Next.js Prisma Database...');

  // 1. Seed Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@farm.com' },
    update: {},
    create: {
      name: 'Admin Peternakan',
      email: 'admin@farm.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@farm.com' },
    update: {},
    create: {
      name: 'Staff Lapangan',
      email: 'staff@farm.com',
      password: staffPassword,
      role: 'STAFF',
    },
  });

  console.log('✅ Users seeded:', { admin: admin.email, staff: staff.email });

  // 2. Seed Cages
  const cage1 = await prisma.cage.upsert({
    where: { name: 'Kandang Sapi Blok A' },
    update: {},
    create: {
      name: 'Kandang Sapi Blok A',
      type: 'Sapi',
      capacity: 10,
      location: 'Blok Utara',
      description: 'Kandang penggemukan sapi potong fasilitas otomatis',
    },
  });

  const cage2 = await prisma.cage.upsert({
    where: { name: 'Kandang Kambing & Domba B1' },
    update: {},
    create: {
      name: 'Kandang Kambing & Domba B1',
      type: 'Kambing',
      capacity: 25,
      location: 'Blok Selatan',
      description: 'Kandang panggung kayu untuk ternak kambing etawa',
    },
  });

  console.log('✅ Cages seeded:', [cage1.name, cage2.name]);

  // 3. Seed Animals
  const animal1 = await prisma.animal.upsert({
    where: { code: 'SAPI-001' },
    update: {},
    create: {
      code: 'SAPI-001',
      name: 'Bima',
      type: 'Sapi',
      breed: 'Limosin',
      gender: 'Jantan',
      birthDate: new Date('2023-01-15'),
      weight: 480.5,
      healthStatus: 'Sehat - Vaksin Lengkap',
      purchasePrice: 16000000,
      estimatedSellingPrice: 24000000,
      cageId: cage1.id,
      origin: 'Peternakan Boyolali',
      notes: 'Nafsu makan sangat tinggi',
      weightHistories: {
        create: [
          { weight: 450.0, notes: 'Berat awal masuk' },
          { weight: 480.5, notes: 'Penimbangan bulan ini' },
        ],
      },
    },
  });

  const animal2 = await prisma.animal.upsert({
    where: { code: 'KMB-001' },
    update: {},
    create: {
      code: 'KMB-001',
      name: 'Sultan',
      type: 'Kambing',
      breed: 'Etawa',
      gender: 'Jantan',
      birthDate: new Date('2023-06-10'),
      weight: 55.0,
      healthStatus: 'Sehat',
      purchasePrice: 3500000,
      estimatedSellingPrice: 5500000,
      cageId: cage2.id,
      origin: 'Peternakan Kaligesing',
      notes: 'Siap kontes / qurban',
      weightHistories: {
        create: [
          { weight: 48.0, notes: 'Masuk kandang' },
          { weight: 55.0, notes: 'Penimbangan rutin' },
        ],
      },
    },
  });

  console.log('✅ Animals seeded:', [animal1.code, animal2.code]);

  // 4. Seed Buyer & Sales
  const buyer = await prisma.buyer.create({
    data: {
      name: 'H. Ahmad Syarif',
      phone: '081234567890',
      address: 'Jl. Raya Merdeka No. 45, Jakarta Selatan',
      notes: 'Pelanggan rutin hewan qurban',
    },
  });

  const soldAnimal = await prisma.animal.create({
    data: {
      code: 'SAPI-002',
      name: 'Barong',
      type: 'Sapi',
      breed: 'Simental',
      gender: 'Jantan',
      birthDate: new Date('2022-11-20'),
      weight: 520.0,
      healthStatus: 'Sehat',
      purchasePrice: 18000000,
      estimatedSellingPrice: 27000000,
      status: 'SOLD',
      cageId: cage1.id,
      origin: 'Peternakan Kediri',
      sale: {
        create: {
          buyerId: buyer.id,
          saleDate: new Date(),
          sellingPrice: 28000000,
          weightAtSale: 520.0,
          paymentMethod: 'TRANSFER',
          notes: 'Lunas via transfer BCA',
        },
      },
    },
  });

  console.log('✅ Buyer & Sales seeded:', buyer.name, soldAnimal.code);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
