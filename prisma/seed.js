const { PrismaClient } = require('../lib/prisma-client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing & Seeding 1 Month Operational Dummy Data (1 - 31 Agustus 2026)...');

  const defaultPassword = await bcrypt.hash('admin123', 10);
  const farmPassword = await bcrypt.hash('farm123', 10);
  const pengemasanPassword = await bcrypt.hash('pengemasan123', 10);
  const pemasaranPassword = await bcrypt.hash('pemasaran123', 10);

  // Clear existing transaction data
  await prisma.notification.deleteMany({});
  await prisma.pelunasanPiutang.deleteMany({});
  await prisma.piutang.deleteMany({});
  await prisma.milkSale.deleteMany({});
  await prisma.bastDocument.deleteMany({});
  await prisma.packagedProduct.deleteMany({});
  await prisma.milkOutflow.deleteMany({});
  await prisma.milkPackaging.deleteMany({});
  await prisma.milkProduction.deleteMany({});
  await prisma.systemLog.deleteMany({});
  await prisma.milkCategory.deleteMany({});

  // 1. Users (4 Roles Utama)
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@susu.com' },
    update: { name: 'Superadmin Pengelola', role: 'SUPERADMIN', password: defaultPassword, isActive: true },
    create: {
      name: 'Superadmin Pengelola',
      email: 'superadmin@susu.com',
      password: defaultPassword,
      role: 'SUPERADMIN',
    },
  });

  const adminFarm = await prisma.user.upsert({
    where: { email: 'farm@susu.com' },
    update: { name: 'Admin Farm Produksi', role: 'ADMIN_FARM', password: farmPassword, isActive: true },
    create: {
      name: 'Admin Farm Produksi',
      email: 'farm@susu.com',
      password: farmPassword,
      role: 'ADMIN_FARM',
    },
  });

  const adminPengemasan = await prisma.user.upsert({
    where: { email: 'pengemasan@susu.com' },
    update: { name: 'Admin Pengemasan', role: 'ADMIN_PENGEMASAN', password: pengemasanPassword, isActive: true },
    create: {
      name: 'Admin Pengemasan',
      email: 'pengemasan@susu.com',
      password: pengemasanPassword,
      role: 'ADMIN_PENGEMASAN',
    },
  });

  const adminPemasaran = await prisma.user.upsert({
    where: { email: 'pemasaran@susu.com' },
    update: { name: 'Admin Pemasaran & Stok', role: 'ADMIN_PEMASARAN', password: pemasaranPassword, isActive: true },
    create: {
      name: 'Admin Pemasaran & Stok',
      email: 'pemasaran@susu.com',
      password: pemasaranPassword,
      role: 'ADMIN_PEMASARAN',
    },
  });

  console.log('✅ Akun User (SUPERADMIN, ADMIN_FARM, ADMIN_PENGEMASAN, ADMIN_PEMASARAN) siap');

  // 2. Kategori Susu (Fokus Susu Sapi)
  const segarCategoriesData = [
    { name: 'Susu Murni Sapi (MYPI)', code: 'MYPI', animalType: 'SAPI', productType: 'SEGAR', defaultPackaging: 'botol', description: 'Susu Murni Segar Hasil Perah Sapi' },
    { name: 'Susu Sapi Segar (HS)', code: 'HS', animalType: 'SAPI', productType: 'SEGAR', defaultPackaging: 'liter', description: 'Hasil Perah Susu Sapi Segar Kategori HS' },
  ];

  for (const cat of segarCategoriesData) {
    await prisma.milkCategory.create({ data: cat });
  }

  // 3. Generate 31 Hari Lengkap (1 s/d 31 Agustus 2026) - 100% Sinkron Farm ➔ Pengemasan ➔ Pemasaran
  console.log('📦 Generating 31 Hari Lengkap Terintegrasi 100% (1 s/d 31 Agustus 2026)...');

  for (let day = 1; day <= 31; day++) {
    const currentDate = new Date(2026, 7, day, 8, 0, 0); // 2026-08-xx
    const factor = 1 + ((day % 5) - 2) * 0.05;

    // --- A. FARM RAW MILK PRODUCTION ---
    const tgs = Math.round(120 * factor);
    const lpk = Math.round(150 * factor);
    const mgl = Math.round(110 * factor);
    const totalPengambilan = tgs + lpk + mgl; // e.g. 342 L pada tgl 20

    const pagiSiapOlah = Math.floor(totalPengambilan / 2);
    const soreSiapOlah = totalPengambilan - pagiSiapOlah;

    const pedetPagi = Math.round(18 * factor);
    const afkirPagi = Math.round(4 * factor);
    const distPagi = Math.round(14 * factor);
    const grossPagi = pagiSiapOlah + pedetPagi + afkirPagi + distPagi;

    const pedetSore = Math.round(18 * factor);
    const afkirSore = Math.round(4 * factor);
    const distSore = Math.round(14 * factor);
    const grossSore = soreSiapOlah + pedetSore + afkirSore + distSore;

    // Sesi Pagi
    await prisma.milkProduction.create({
      data: {
        date: new Date(2026, 7, day, 7, 0, 0),
        tanggal: new Date(2026, 7, day, 7, 0, 0),
        productType: 'SEGAR',
        animalType: 'SAPI',
        grossVolumeLiters: grossPagi,
        produksi: grossPagi,
        pedetVolumeLiters: pedetPagi,
        setorPedet: pedetPagi,
        afkirVolumeLiters: afkirPagi,
        rusakAfkir: afkirPagi,
        rawVolumeLiters: pagiSiapOlah,
        kirimKePI: pagiSiapOlah,
        processedLiters: pagiSiapOlah,
        packagedQty: pagiSiapOlah,
        notes: `Perah pagi tanggal ${day} Agustus 2026 seluruh kandang.`,
        createdById: adminFarm.id,
      },
    });

    // Sesi Sore
    await prisma.milkProduction.create({
      data: {
        date: new Date(2026, 7, day, 16, 0, 0),
        tanggal: new Date(2026, 7, day, 16, 0, 0),
        productType: 'SEGAR',
        animalType: 'SAPI',
        grossVolumeLiters: grossSore,
        produksi: grossSore,
        pedetVolumeLiters: pedetSore,
        setorPedet: pedetSore,
        afkirVolumeLiters: afkirSore,
        rusakAfkir: afkirSore,
        rawVolumeLiters: soreSiapOlah,
        kirimKePI: soreSiapOlah,
        processedLiters: soreSiapOlah,
        packagedQty: soreSiapOlah,
        notes: `Perah sore tanggal ${day} Agustus 2026 seluruh kandang.`,
        createdById: adminFarm.id,
      },
    });

    // --- B. PENGEMASAN OLIVE PRODUCTS (HASIL PENGOLAHAN) ---
    // EXACT SAME QUANTITIES matching the 27-Column Report
    const s115 = Math.round(450 * factor);
    const s130 = Math.round(200 * factor);
    const s200 = Math.round(300 * factor);
    const s250 = Math.round(500 * factor);
    const y200 = Math.round(250 * factor);
    const keju = Math.round(80 * factor);
    const isPending = day >= 20;

    const s115Rasa = Math.round(s115 * 0.65);
    const s115Ori = s115 - s115Rasa;

    const s130Rasa = Math.round(s130 * 0.60);
    const s130Ori = s130 - s130Rasa;

    const s200Rasa = Math.round(s200 * 0.60);
    const s200Ori = s200 - s200Rasa;

    const s250Rasa = Math.round(s250 * 0.65);
    const s250Ori = s250 - s250Rasa;

    const olahanDailyList = [
      { jenis: 'Susu Pasteurisasi Rasa', kemasan: 'Cup 115 ml', qty: s115Rasa, variant: 'Cokelat & Stroberi' },
      { jenis: 'Susu Pasteurisasi Rasa', kemasan: 'Botol 130 ml', qty: s130Rasa, variant: 'Cokelat & Stroberi' },
      { jenis: 'Susu Pasteurisasi Rasa', kemasan: 'Botol 200 ml', qty: s200Rasa, variant: 'Cokelat & Stroberi' },
      { jenis: 'Susu Pasteurisasi Rasa', kemasan: 'Botol 250 ml', qty: s250Rasa, variant: 'Cokelat & Stroberi' },

      { jenis: 'Susu Pasteurisasi Original', kemasan: 'Cup 115 ml', qty: s115Ori, variant: 'Original Plain' },
      { jenis: 'Susu Pasteurisasi Original', kemasan: 'Botol 130 ml', qty: s130Ori, variant: 'Original Plain' },
      { jenis: 'Susu Pasteurisasi Original', kemasan: 'Botol 200 ml', qty: s200Ori, variant: 'Original Plain' },
      { jenis: 'Susu Pasteurisasi Original', kemasan: 'Botol 250 ml', qty: s250Ori, variant: 'Original Plain' },

      { jenis: 'Yogurt', kemasan: 'Botol 200 ml', qty: y200, variant: 'Plain & Aneka Buah' },
      { jenis: 'Keju', kemasan: 'Cup 100 gram', qty: keju, variant: 'Keju Olahan BBPTU' },
    ];

    for (const item of olahanDailyList) {
      await prisma.packagedProduct.create({
        data: {
          tanggal: new Date(2026, 7, day, 10, 0, 0),
          jenisProduk: item.jenis,
          kemasan: item.kemasan,
          jumlah: item.qty,
          status: isPending ? 'MENUNGGU_PENERIMAAN' : 'DITERIMA',
          receivedAt: isPending ? null : new Date(2026, 7, day, 14, 0, 0),
          receivedByName: isPending ? null : adminPemasaran.name,
          condition: isPending ? null : 'Sesuai',
          notes: `Batch hasil pengolahan tanggal ${day} Agustus 2026 (${item.kemasan}).`,
          createdById: adminPengemasan.id,
        },
      });
    }

    // MilkPackaging model (Aggregate compatibility)
    await prisma.milkPackaging.create({
      data: {
        date: currentDate,
        productCategory: 'Susu',
        productSubtype: 'Susu Olahan & Pasturisasi',
        origin: 'Sapi',
        variant: 'Cokelat, Stroberi & Segar',
        animalType: 'SAPI',
        processedAmount: totalPengambilan,
        processedLiters: totalPengambilan,
        totalPackagedQty: s115 + s130 + s200 + s250 + y200,
        botolQty: s115 + s130 + s200 + s250 + y200,
        status: isPending ? 'MENUNGGU_PENERIMAAN' : 'DITERIMA',
        receivedAt: isPending ? null : new Date(currentDate.getTime() + 14 * 3600000),
        receivedByName: isPending ? null : adminPemasaran.name,
        notes: `Pengolahan susu segar tanggal ${day} Agustus 2026 (Pengambilan: ${totalPengambilan} L).`,
        createdById: adminPengemasan.id,
      },
    });
  }

  // 4. Generate Dokumen BAST (Permintaan Susu Segar oleh Pemasaran untuk Farm) across August
  console.log('📜 Generating Dokumen BAST Permintaan Pemasaran (1 - 31 Agustus 2026)...');
  const bastDemands = [
    { type: 'PENJUALAN_LANGSUNG', client: 'Kedai Susu Segar Mas Budi', note: 'Permintaan susu fresh untuk distribusi penjualan langsung.' },
    { type: 'HIBAH', client: 'Posyandu Melati Baturraden', note: 'Permintaan susu fresh untuk program hibah balita & posyandu.' },
    { type: 'PENJUALAN_LANGSUNG', client: 'Koperasi Susu Mulia', note: 'Permintaan pasokan susu fresh ber-BAST resmi.' },
    { type: 'HIBAH', client: 'Panti Asuhan Al-Hikmah Baturraden', note: 'Permintaan susu fresh hibah santunan sosial.' },
  ];

  for (let day = 1; day <= 31; day += 2) {
    const d = new Date(2026, 7, day, 9, 0, 0);
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateCode = `202608${dayStr}`;
    const nomorBast = `BAST/PEMASARAN/${dateCode}/${1000 + day}`;
    const vol = 120 + ((day * 7) % 60);
    const demand = bastDemands[day % bastDemands.length];
    const isPending = day >= 20;

    await prisma.bastDocument.create({
      data: {
        nomorBast,
        tanggal: d,
        sumber: 'SUSU_SEGAR',
        volumeLiters: vol,
        jenisPermintaan: demand.type,
        instansiPenerima: demand.client,
        pengirimNama: adminPemasaran.name,
        pengirimRole: 'ADMIN_PEMASARAN',
        penerimaNama: isPending ? 'Unit Farm Produksi BBPTUHPT' : adminFarm.name,
        penerimaRole: 'ADMIN_FARM',
        status: isPending ? 'MENUNGGU_KONFIRMASI' : 'DITERIMA',
        confirmedAt: isPending ? null : d,
        catatan: isPending
          ? `Permintaan: ${demand.note}. Menunggu serah terima fisik dari Farm tanggal ${day} Agustus 2026.`
          : `Permintaan: ${demand.note}. Telah diserahterimakan fisik oleh Farm tanggal ${day} Agustus 2026.`,
        createdById: adminPemasaran.id,
      },
    });
  }

  // 5. Generate Transaksi Penjualan Susu Fresh & Olahan
  console.log('💰 Generating Transaksi Penjualan 1 - 31 Agustus 2026...');
  const buyersList = [
    'Koperasi Susu Mulia',
    'Toko Berkah Sejahtera',
    'Ibu Hajjah Sinta',
    'Bapak Ahmad Kurnia',
    'CV Sumber Rejeki',
    'Kedai Susu Segar Mas Budi',
    'Ibu Ratna Pertiwi',
    'Kantin Sehat BBPTU',
  ];

  for (let day = 1; day <= 31; day += 2) {
    const d = new Date(2026, 7, day, 11, 0, 0);
    const buyer = buyersList[day % buyersList.length];
    const vol = 30 + ((day * 5) % 50);
    const unitPrice = 12000;
    const totalPrice = vol * unitPrice;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const trxId = `TRX-FRESH-202608${dayStr}-${100 + day}`;

    await prisma.milkSale.create({
      data: {
        transactionId: trxId,
        date: d,
        tanggal: d,
        sumber: 'FRESH',
        jumlah: vol,
        quantity: vol,
        pembeli: buyer,
        hargaJual: totalPrice,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        kategoriBayar: 'PNBP',
        status: 'Berhasil',
        catatan: `Penjualan susu fresh tanggal ${day} Agustus 2026 setor PNBP tunai lunas.`,
        createdById: adminPemasaran.id,
      },
    });
  }

  // 6. System Logs
  console.log('📋 Generating Activity System Logs...');
  const logsData = [
    { email: adminFarm.email, action: 'CREATE_PRODUCTION', details: 'Input produksi harian susu sapi tanggal 1 - 31 Agustus 2026' },
    { email: adminFarm.email, action: 'CREATE_BAST', details: 'Menerbitkan BAST penyerahan susu mentah ke Pemasaran' },
    { email: adminPengemasan.email, action: 'CREATE_PACKAGING', details: 'Pengemasan Susu Olahan Rasa Botol 250ml' },
    { email: adminPemasaran.email, action: 'CONFIRM_BAST', details: 'Mengonfirmasi pengesahan BAST Hardfile Susu Segar' },
    { email: adminPemasaran.email, action: 'CREATE_MILK_SALE', details: 'Penjualan Susu Fresh PNBP' },
  ];

  for (const l of logsData) {
    await prisma.systemLog.create({
      data: {
        userId: superadmin.id,
        userEmail: l.email,
        action: l.action,
        details: l.details,
      },
    });
  }

  // 7. Seed Sample Notifications for Pemasaran
  console.log('🔔 Generating Initial Inflow Notifications...');
  const notifsData = [
    {
      title: 'Stok Baru Masuk: Susu Pasteurisasi Rasa Cokelat & Stroberi',
      message: 'Admin Pengolahan telah menginput batch pengemasan Susu Pasteurisasi Rasa (Botol 250ml & Cup 115ml) sebanyak 500 pcs ke stok Pemasaran.',
      type: 'STOCK_ADDED',
      targetRole: 'ADMIN_PEMASARAN',
      senderName: adminPengemasan.name,
      senderRole: 'ADMIN_PENGEMASAN',
      link: '/pemasaran/terima-data',
      metadata: JSON.stringify({ category: 'Susu', subtype: 'Susu Pasteurisasi', variant: 'Cokelat & Stroberi', quantity: 500, unit: 'pcs' }),
    },
    {
      title: 'Stok Baru Masuk: Yogurt Aneka Buah',
      message: 'Admin Pengolahan telah menginput batch Yogurt Botol 200ml sebanyak 250 pcs ke stok Pemasaran.',
      type: 'STOCK_ADDED',
      targetRole: 'ADMIN_PEMASARAN',
      senderName: adminPengemasan.name,
      senderRole: 'ADMIN_PENGEMASAN',
      link: '/pemasaran/terima-data',
      metadata: JSON.stringify({ category: 'Yogurt', variant: 'Plain & Aneka Buah', quantity: 250, unit: 'pcs' }),
    },
  ];

  for (const n of notifsData) {
    await prisma.notification.create({ data: n });
  }

  console.log('🎉 SEEDING DATA 1 - 31 AGUSTUS 2026 BERHASIL SELESAI (100% SINKRON TERINTEGRASI)!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
