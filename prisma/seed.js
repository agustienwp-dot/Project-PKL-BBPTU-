const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing & Resetting Database Stok (Clean State = 0)...');

  const defaultPassword = await bcrypt.hash('admin123', 10);
  const farmPassword = await bcrypt.hash('farm123', 10);
  const pengemasanPassword = await bcrypt.hash('pengemasan123', 10);
  const pemasaranPassword = await bcrypt.hash('pemasaran123', 10);

  // Clear existing transaction data
  await prisma.milkOutflow.deleteMany({});
  await prisma.milkPackaging.deleteMany({});
  await prisma.milkProduction.deleteMany({});
  await prisma.systemLog.deleteMany({});
  await prisma.milkCategory.deleteMany({});

  // 1. Users (4 Roles Utama)
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@susu.com' },
    update: { name: 'Superadmin Pengelola', role: 'SUPERADMIN', password: defaultPassword, is_active: true },
    create: {
      name: 'Superadmin Pengelola',
      email: 'superadmin@susu.com',
      password: defaultPassword,
      role: 'SUPERADMIN',
    },
  });

  const adminFarm = await prisma.user.upsert({
    where: { email: 'farm@susu.com' },
    update: { name: 'Admin Farm Produksi', role: 'ADMIN_FARM', password: farmPassword, is_active: true },
    create: {
      name: 'Admin Farm Produksi',
      email: 'farm@susu.com',
      password: farmPassword,
      role: 'ADMIN_FARM',
    },
  });

  const adminPengemasan = await prisma.user.upsert({
    where: { email: 'pengemasan@susu.com' },
    update: { name: 'Admin Pengemasan', role: 'ADMIN_PENGEMASAN', password: pengemasanPassword, is_active: true },
    create: {
      name: 'Admin Pengemasan',
      email: 'pengemasan@susu.com',
      password: pengemasanPassword,
      role: 'ADMIN_PENGEMASAN',
    },
  });

  const adminPemasaran = await prisma.user.upsert({
    where: { email: 'pemasaran@susu.com' },
    update: { name: 'Admin Pemasaran & Stok', role: 'ADMIN_PEMASARAN', password: pemasaranPassword, is_active: true },
    create: {
      name: 'Admin Pemasaran & Stok',
      email: 'pemasaran@susu.com',
      password: pemasaranPassword,
      role: 'ADMIN_PEMASARAN',
    },
  });

  console.log('✅ Akun User (SUPERADMIN, ADMIN_FARM, ADMIN_PENGEMASAN, ADMIN_PEMASARAN) siap');

  // 2. Kategori SUSU SEGAR (Susu Sapi & Susu Kambing)
  const segarCategoriesData = [
    { name: 'Susu Murni Sapi (MYPI)', code: 'MYPI', animal_type: 'SAPI', product_type: 'SEGAR', default_packaging: 'botol', description: 'Susu Murni Segar Hasil Perah Sapi (MYPI)' },
    { name: 'Susu Sapi Segar (HS)', code: 'HS', animal_type: 'SAPI', product_type: 'SEGAR', default_packaging: 'liter', description: 'Hasil Perah Susu Sapi Segar Kategori HS' },
    { name: 'Susu Sapi Segar (HT)', code: 'HT', animal_type: 'SAPI', product_type: 'SEGAR', default_packaging: 'liter', description: 'Hasil Perah Susu Sapi Segar Kategori HT' },
    { name: 'Susu Sapi Segar (OS)', code: 'OS', animal_type: 'SAPI', product_type: 'SEGAR', default_packaging: 'botol', description: 'Olahan Segar Susu Sapi Kategori OS' },
    { name: 'Penjualan Segar Sapi (JS)', code: 'JS', animal_type: 'SAPI', product_type: 'SEGAR', default_packaging: 'botol', description: 'Penjualan Susu Sapi Segar (Piutang JS)' },
    { name: 'Penjualan Segar Sapi PNBP (JS PNBP)', code: 'JS_PNBP', animal_type: 'SAPI', product_type: 'SEGAR', default_packaging: 'botol', description: 'Penjualan Susu Sapi Segar Setor PNBP' },
    { name: 'Bulk Segar Sapi (BS)', code: 'BS', animal_type: 'SAPI', product_type: 'SEGAR', default_packaging: 'botol', description: 'Bulk Segar Sapi Kategori BS' },
    { name: 'Jual Laktasi Bulk Sapi (JLB)', code: 'JLB', animal_type: 'SAPI', product_type: 'SEGAR', default_packaging: 'liter', description: 'Jual Laktasi Bulk Volume Sapi' },
    { name: 'Beli Laktasi Bulk Sapi (BLB)', code: 'BLB', animal_type: 'SAPI', product_type: 'SEGAR', default_packaging: 'liter', description: 'Beli Laktasi Bulk Volume Sapi' },
    // Kategori Susu Kambing Segar
    { name: 'Susu Murni Kambing (KMPI)', code: 'KMPI', animal_type: 'KAMBING', product_type: 'SEGAR', default_packaging: 'liter', description: 'Susu Murni Segar Hasil Perah Kambing (KMPI)' },
    { name: 'Susu Kambing Segar (KS)', code: 'KS', animal_type: 'KAMBING', product_type: 'SEGAR', default_packaging: 'liter', description: 'Hasil Perah Susu Kambing Segar Kategori KS' },
    { name: 'Susu Kambing Etawa Segar (KETAWA)', code: 'KETAWA', animal_type: 'KAMBING', product_type: 'SEGAR', default_packaging: 'botol', description: 'Susu Segar Kambing Perah Etawa Premium' },
  ];

  for (const cat of segarCategoriesData) {
    await prisma.milkCategory.create({ data: cat });
  }

  // 3. Kategori SUSU OLAHAN (11 Kode Lapangan)
  const olahanCategoriesData = [
    { name: 'Rasa Susu 110ml (RS 110)', code: 'RS_110', animal_type: 'SAPI', product_type: 'OLAHAN', default_packaging: 'pack', description: 'Susu Olahan Rasa Kemasan 110ml' },
    { name: 'Rasa Susu 200ml (RS 200)', code: 'RS_200', animal_type: 'SAPI', product_type: 'OLAHAN', default_packaging: 'pack', description: 'Susu Olahan Rasa Kemasan 200ml' },
    { name: 'Rasa Susu 500ml (RS 500)', code: 'RS_500', animal_type: 'SAPI', product_type: 'OLAHAN', default_packaging: 'botol', description: 'Susu Olahan Rasa Botol 500ml' },
    { name: 'Jeruk Susu 110ml (JS 110)', code: 'JS_110', animal_type: 'SAPI', product_type: 'OLAHAN', default_packaging: 'pack', description: 'Susu Olahan Rasa Jeruk 110ml' },
    { name: 'Jeruk Susu 250ml (JS 250)', code: 'JS_250', animal_type: 'SAPI', product_type: 'OLAHAN', default_packaging: 'cup', description: 'Susu Olahan Rasa Jeruk Cup 250ml' },
    { name: 'Hijau Susu 110ml (HS 110)', code: 'HS_110', animal_type: 'SAPI', product_type: 'OLAHAN', default_packaging: 'pack', description: 'Susu Olahan Rasa Melon/Matcha 110ml' },
    { name: 'Hijau Susu 200ml (HS 200)', code: 'HS_200', animal_type: 'SAPI', product_type: 'OLAHAN', default_packaging: 'pack', description: 'Susu Olahan Rasa Melon/Matcha 200ml' },
    { name: 'Hijau Vanilla 200ml (HV 200)', code: 'HV_200', animal_type: 'SAPI', product_type: 'OLAHAN', default_packaging: 'pack', description: 'Susu Olahan Rasa Vanilla 200ml' },
    { name: 'Susu Es 110ml (SE 110)', code: 'SE_110', animal_type: 'SAPI', product_type: 'OLAHAN', default_packaging: 'pack', description: 'Susu Olahan Es Kemasan 110ml' },
    { name: 'Susu Es 200ml (SE 200)', code: 'SE_200', animal_type: 'SAPI', product_type: 'OLAHAN', default_packaging: 'pack', description: 'Susu Olahan Es Kemasan 200ml' },
    { name: 'Yogurt Es 200ml (YE 200)', code: 'YE_200', animal_type: 'SAPI', product_type: 'OLAHAN', default_packaging: 'cup', description: 'Olahan Yogurt Segar Cup 200ml' },
  ];

  for (const cat of olahanCategoriesData) {
    await prisma.milkCategory.create({ data: cat });
  }

  console.log('✅ Master Kategori Susu Segar (9) & Susu Olahan (11) siap');

  // Log Initial Reset Action
  await prisma.systemLog.create({
    data: {
      user_id: superadmin.id,
      user_email: superadmin.email,
      action: 'RESET_DATABASE_STOK',
      details: 'Seluruh riwayat produksi, pengeluaran produk, dan stok di-reset ke 0 (Clean State).',
    },
  });

  console.log('✨ Reset Database Berhasil! Seluruh Stok Dimulai dari 0.');
}

main()
  .catch((e) => {
    console.error('❌ Error resetting database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
