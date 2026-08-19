const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing & Seeding 1 Month Operational Dummy Data...');

  const defaultPassword = await bcrypt.hash('admin123', 10);
  const farmPassword = await bcrypt.hash('farm123', 10);
  const pengemasanPassword = await bcrypt.hash('pengemasan123', 10);
  const pemasaranPassword = await bcrypt.hash('pemasaran123', 10);

  // Clear existing transaction data
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
    update: { name: 'Admin Pengemasan Olahan', role: 'ADMIN_PENGEMASAN', password: pengemasanPassword, isActive: true },
    create: {
      name: 'Admin Pengemasan Olahan',
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

  console.log('✅ Akun User (SUPERADMIN, ADMIN_FARM, ADMIN_PENGEMASAN, ADMIN_PEMASARAN) Siap');

  // 2. Kategori Susu
  const segarCategoriesData = [
    { name: 'Susu Murni Sapi (MYPI)', code: 'MYPI', animalType: 'SAPI', productType: 'SEGAR', defaultPackaging: 'botol', description: 'Susu Murni Segar Hasil Perah Sapi' },
    { name: 'Susu Sapi Segar (HS)', code: 'HS', animalType: 'SAPI', productType: 'SEGAR', defaultPackaging: 'liter', description: 'Hasil Perah Susu Sapi Segar Kategori HS' },
    { name: 'Susu Kambing Segar (KMPI)', code: 'KMPI', animalType: 'KAMBING', productType: 'SEGAR', defaultPackaging: 'liter', description: 'Susu Murni Segar Hasil Perah Kambing' },
  ];

  const createdCategories = [];
  for (const cat of segarCategoriesData) {
    const c = await prisma.milkCategory.create({ data: cat });
    createdCategories.push(c);
  }

  // 3. Generate 30 Hari Produksi Susu (20 Juli 2026 - 19 Agustus 2026)
  console.log('📦 Generating 30 Hari Data Produksi Susu Farm...');
  const startDate = new Date(2026, 6, 20); // 20 Juli 2026
  const createdProductions = [];

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    // Produksi Sapi Harian
    const grossSapi = 180 + Math.floor(Math.random() * 60); // 180 - 240 L
    const pedetSapi = 20 + Math.floor(Math.random() * 10); // 20 - 30 L
    const afkirSapi = 2 + Math.floor(Math.random() * 6); // 2 - 8 L
    const netSapi = Math.max(0, grossSapi - pedetSapi - afkirSapi);

    const prodSapi = await prisma.milkProduction.create({
      data: {
        date: currentDate,
        tanggal: currentDate,
        productType: 'SEGAR',
        animalType: 'SAPI',
        grossVolumeLiters: grossSapi,
        produksi: grossSapi,
        pedetVolumeLiters: pedetSapi,
        setorPedet: pedetSapi,
        afkirVolumeLiters: afkirSapi,
        rusakAfkir: afkirSapi,
        rawVolumeLiters: netSapi,
        kirimKePI: netSapi,
        processedLiters: netSapi,
        packagedQty: Math.round(netSapi),
        notes: `Pemerahan pagi & sore kandang Sapi A. Cuaca bagus.`,
        createdById: adminFarm.id,
      },
    });
    createdProductions.push(prodSapi);

    // Produksi Kambing setiap 3 hari
    if (i % 3 === 0) {
      const grossKambing = 40 + Math.floor(Math.random() * 25);
      const pedetKambing = 5 + Math.floor(Math.random() * 5);
      const afkirKambing = 1 + Math.floor(Math.random() * 3);
      const netKambing = Math.max(0, grossKambing - pedetKambing - afkirKambing);

      await prisma.milkProduction.create({
        data: {
          date: currentDate,
          tanggal: currentDate,
          productType: 'SEGAR',
          animalType: 'KAMBING',
          grossVolumeLiters: grossKambing,
          produksi: grossKambing,
          pedetVolumeLiters: pedetKambing,
          setorPedet: pedetKambing,
          afkirVolumeLiters: afkirKambing,
          rusakAfkir: afkirKambing,
          rawVolumeLiters: netKambing,
          kirimKePI: netKambing,
          processedLiters: netKambing,
          packagedQty: Math.round(netKambing),
          notes: `Pemerahan kambing etawa blok B.`,
          createdById: adminFarm.id,
        },
      });
    }
  }

  // 4. Generate Dokumen BAST (Hardfile Penyerahan Susu Segar)
  console.log('📜 Generating Dokumen BAST Hardfile (Farm -> Pemasaran)...');
  const bastDates = [
    new Date(2026, 6, 21),
    new Date(2026, 6, 24),
    new Date(2026, 6, 27),
    new Date(2026, 6, 30),
    new Date(2026, 7, 2),
    new Date(2026, 7, 5),
    new Date(2026, 7, 8),
    new Date(2026, 7, 11),
    new Date(2026, 7, 14),
    new Date(2026, 7, 17),
    new Date(2026, 7, 18),
    new Date(2026, 7, 19), // Hari ini (Menunggu Konfirmasi)
  ];

  const bastDemands = [
    { type: 'PENJUALAN_LANGSUNG', client: 'Kedai Susu Segar Mas Budi', note: 'Permintaan pengiriman susu fresh harian (Penjualan Langsung).' },
    { type: 'HIBAH', client: 'Program CSR Gizi Anak Sekolah Baturraden', note: 'Penyaluran Susu Hibah Program Nutrisi BBPTUHPT.' },
    { type: 'PENJUALAN_LANGSUNG', client: 'Koperasi Susu Mulia', note: 'Order pembelian susu mentah segar ber-BAST resmi.' },
    { type: 'KERJASAMA', client: 'Fakultas Peternakan Unsoed', note: 'Permintaan riset & pelatihan pengolahan susu perah.' },
  ];

  for (let idx = 0; idx < bastDates.length; idx++) {
    const d = bastDates[idx];
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
    const numSuffix = (1001 + idx).toString();
    const nomorBast = `BAST/BBPTU/${dateStr}/${numSuffix}`;
    const vol = 150 + Math.floor(Math.random() * 80);
    const demand = bastDemands[idx % bastDemands.length];

    // 3 BAST terakhir masih MENUNGGU_KONFIRMASI agar notifikasi Pemasaran menyala!
    const isPending = idx >= 9;

    await prisma.bastDocument.create({
      data: {
        nomorBast,
        tanggal: d,
        sumber: 'SUSU_SEGAR',
        volumeLiters: vol,
        jenisPermintaan: demand.type,
        instansiPenerima: demand.client,
        pengirimNama: adminFarm.name,
        pengirimRole: 'ADMIN_FARM',
        penerimaNama: isPending ? null : adminPemasaran.name,
        penerimaRole: isPending ? null : 'ADMIN_PEMASARAN',
        status: isPending ? 'MENUNGGU_KONFIRMASI' : 'DITERIMA',
        confirmedAt: isPending ? null : d,
        catatan: isPending
          ? `Permintaan: ${demand.note}. Hardfile BAST diserahkan saat pengantaran susu murni pagi.`
          : `Permintaan: ${demand.note}. Dokumen BAST hardfile fisik telah diterima & volume sesuai.`,
        createdById: adminFarm.id,
      },
    });
  }

  // 5. Generate Hasil Pengemasan Produk Olahan (Admin Pengemasan)
  console.log('🧪 Generating Produk Olahan (250 ml & 110 ml)...');
  const olahanVariants = [
    { jenis: 'Susu Olahan Rasa', kemasan: 'Botol 250 ml' },
    { jenis: 'Susu Olahan Rasa', kemasan: 'Botol 110 ml' },
    { jenis: 'Keju', kemasan: 'Botol 250 ml' },
    { jenis: 'Keju', kemasan: 'Botol 110 ml' },
    { jenis: 'Yogurt', kemasan: 'Botol 250 ml' },
    { jenis: 'Yogurt', kemasan: 'Botol 110 ml' },
  ];

  const createdPackagedProducts = [];
  for (let k = 0; k < 18; k++) {
    const d = new Date(2026, 6, 21 + Math.floor(k * 1.5));
    const variant = olahanVariants[k % olahanVariants.length];
    const qty = 80 + Math.floor(Math.random() * 150); // 80 - 230 pcs

    // 4 olahan terbaru masih MENUNGGU_PENERIMAAN agar notifikasi Pemasaran menyala!
    const isPending = k >= 14;

    const pkg = await prisma.packagedProduct.create({
      data: {
        tanggal: d,
        jenisProduk: variant.jenis,
        kemasan: variant.kemasan,
        jumlah: qty,
        status: isPending ? 'MENUNGGU_PENERIMAAN' : 'DITERIMA',
        receivedAt: isPending ? null : d,
        receivedByName: isPending ? null : adminPemasaran.name,
        condition: isPending ? null : 'Sesuai',
        notes: isPending ? 'Hasil kemasan segar siap kirim ke Pemasaran.' : 'Kondisi kemasan utuh dan telah masuk stok Pemasaran.',
        createdById: adminPengemasan.id,
      },
    });
    createdPackagedProducts.push(pkg);
  }

  // 6. Generate Penjualan Susu Fresh & Olahan (Admin Pemasaran)
  console.log('💰 Generating Transaksi Penjualan Fresh, Olahan, & Piutang...');
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

  // A. Penjualan Susu Fresh
  for (let s = 0; s < 15; s++) {
    const d = new Date(2026, 6, 22 + Math.floor(s * 1.8));
    const buyer = buyersList[s % buyersList.length];
    const vol = 20 + Math.floor(Math.random() * 60); // 20 - 80 L
    const unitPrice = 12000;
    const totalPrice = vol * unitPrice;
    const isPiutang = s % 3 === 0; // Sebagian transaksi Piutang
    const trxId = `TRX-FRESH-202607${10 + s}-${100 + s}`;

    const sale = await prisma.milkSale.create({
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
        kategoriBayar: isPiutang ? 'PIUTANG' : 'PNBP',
        status: 'Berhasil',
        catatan: isPiutang ? 'Pembayaran tempo 14 hari.' : 'Setor PNBP tunai lunas.',
        createdById: adminPemasaran.id,
      },
    });

    if (isPiutang) {
      const isLunas = s % 6 === 0;
      const sisa = isLunas ? 0 : totalPrice * 0.4;

      const piutangObj = await prisma.piutang.create({
        data: {
          milkSaleId: sale.id,
          jumlahAwal: totalPrice,
          sisaPiutang: sisa,
          lunas: isLunas,
          createdAt: d,
        },
      });

      if (totalPrice - sisa > 0) {
        await prisma.pelunasanPiutang.create({
          data: {
            piutangId: piutangObj.id,
            jumlah: totalPrice - sisa,
            tanggal: new Date(d.getTime() + 5 * 86400000), // 5 hari setelahnya
            catatan: isLunas ? 'Pelunasan sisa piutang 100%' : 'Pembayaran DP 60%',
          },
        });
      }
    }
  }

  // B. Penjualan Susu Olahan (Hanya dari produk yang status DITERIMA)
  const confirmedProducts = createdPackagedProducts.filter((p) => p.status === 'DITERIMA');

  for (let o = 0; o < 12; o++) {
    const targetProduct = confirmedProducts[o % confirmedProducts.length];
    const d = new Date(targetProduct.tanggal.getTime() + 86400000);
    const buyer = buyersList[(o + 2) % buyersList.length];
    const qty = 10 + Math.floor(Math.random() * 30);
    const pricePerUnit = targetProduct.kemasan.includes('250') ? 15000 : 8000;
    const totalPrice = qty * pricePerUnit;
    const isPiutang = o % 4 === 0;
    const trxId = `TRX-OLAHAN-202608${10 + o}-${200 + o}`;

    const sale = await prisma.milkSale.create({
      data: {
        transactionId: trxId,
        date: d,
        tanggal: d,
        sumber: 'OLAHAN',
        produkRefId: targetProduct.id,
        jumlah: qty,
        quantity: qty,
        pembeli: buyer,
        hargaJual: totalPrice,
        unitPrice: pricePerUnit,
        totalPrice: totalPrice,
        kategoriBayar: isPiutang ? 'PIUTANG' : 'PNBP',
        status: 'Berhasil',
        notes: `Penjualan ${targetProduct.jenisProduk} - ${targetProduct.kemasan}`,
        catatan: `Penjualan ${targetProduct.jenisProduk} - ${targetProduct.kemasan}`,
        createdById: adminPemasaran.id,
      },
    });

    if (isPiutang) {
      const piutangObj = await prisma.piutang.create({
        data: {
          milkSaleId: sale.id,
          jumlahAwal: totalPrice,
          sisaPiutang: totalPrice * 0.5,
          lunas: false,
          createdAt: d,
        },
      });

      await prisma.pelunasanPiutang.create({
        data: {
          piutangId: piutangObj.id,
          jumlah: totalPrice * 0.5,
          tanggal: new Date(d.getTime() + 3 * 86400000),
          catatan: 'DP 50% produk olahan',
        },
      });
    }
  }

  // 7. System Logs
  console.log('📋 Generating Activity System Logs...');
  const logsData = [
    { email: adminFarm.email, action: 'CREATE_PRODUCTION', details: 'Input produksi harian susu sapi 220 L' },
    { email: adminFarm.email, action: 'CREATE_BAST', details: 'Menerbitkan BAST Hardfile penyerahan susu mentah ke Pemasaran' },
    { email: adminPengemasan.email, action: 'CREATE_PACKAGING', details: 'Pengemasan Susu Olahan Rasa Botol 250ml 150 pcs' },
    { email: adminPemasaran.email, action: 'CONFIRM_BAST', details: 'Mengonfirmasi pengesahan BAST Hardfile Susu Segar' },
    { email: adminPemasaran.email, action: 'CONFIRM_PACKAGED_PRODUCT', details: 'Mengonfirmasi terima produk olahan Yogurt Botol 110ml 100 pcs ke stok' },
    { email: adminPemasaran.email, action: 'CREATE_MILK_SALE', details: 'Penjualan Susu Fresh 50 Liter PNBP ke Toko Berkah' },
    { email: adminPemasaran.email, action: 'PELUNASAN_PIUTANG', details: 'Pencatatan pelunasan piutang Koperasi Susu Mulia Rp 300.000' },
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

  console.log('🎉 POPULASI DATA DUMMY 1 BULAN SELESAI!');
  console.log('✨ 30 Hari Produksi Susu, 12 BAST Hardfile, 18 Hasil Pengemasan, 27 Transaksi Penjualan, & Piutang Siap di Uji Coba!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
