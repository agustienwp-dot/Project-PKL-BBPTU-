const { PrismaClient } = require('../lib/prisma-client');
const prisma = new PrismaClient();

async function seedDistribusiDummy() {
  console.log('🚀 Seeding dummy data Distribusi Susu Segar (Sapi & Kambing) dengan sisa stok belum terjual...');

  // Get users
  const adminFarm = await prisma.user.findFirst({ where: { role: 'ADMIN_FARM' } });
  const adminPemasaran = await prisma.user.findFirst({ where: { role: 'ADMIN_PEMASARAN' } });

  const farmId = adminFarm ? adminFarm.id : null;
  const pemasaranId = adminPemasaran ? adminPemasaran.id : null;

  // Clear September 2026 records for fresh milk production and BAST to replace with consistent scenario
  const septStart = new Date('2026-09-01T00:00:00.000Z');
  const septEnd = new Date('2026-09-30T23:59:59.999Z');

  await prisma.bastDocument.deleteMany({
    where: {
      tanggal: {
        gte: septStart,
        lte: septEnd,
      },
    },
  });

  await prisma.milkProduction.deleteMany({
    where: {
      date: {
        gte: septStart,
        lte: septEnd,
      },
    },
  });

  // 1. Data Scenario Susu Sapi (1 - 7 September 2026)
  const sapiDailyScenarios = [
    {
      day: 1,
      pagiGross: 90,
      pagiPedet: 8,
      pagiAfkir: 1,
      soreGross: 70,
      sorePedet: 7,
      soreAfkir: 1,
      basts: [
        { type: 'PENJUALAN_LANGSUNG', dest: 'Kantin Eduwisata', vol: 30, num: '001', note: 'Distribusi penjualan kantin eduwisata' },
        { type: 'PENJUALAN_LANGSUNG', dest: 'Mitra SPPG', vol: 50, num: '002', note: 'Pasokan langganan harian SPPG' },
        { type: 'HIBAH', dest: 'Yayasan Peduli Sosial', vol: 15, num: '003', note: 'Penyaluran hibah sosial baturraden' },
      ], // Total BAST: 95 L, Net Farm: 143 L, Sisa: 48 L
    },
    {
      day: 2,
      pagiGross: 95,
      pagiPedet: 7,
      pagiAfkir: 1,
      soreGross: 75,
      sorePedet: 7,
      soreAfkir: 2,
      basts: [
        { type: 'PENJUALAN_LANGSUNG', dest: 'Mitra SPPG', vol: 60, num: '001', note: 'Pasokan harian SPPG' },
        { type: 'PENJUALAN_LANGSUNG', dest: 'Konsumen Umum (Kedai Berkah)', vol: 25, num: '002', note: 'Penjualan ke kedai susu umum' },
        { type: 'HIBAH', dest: 'Tamu Kedinasan Ditjen PKH', vol: 10, num: '003', note: 'Hibah cenderamata kunjungan dinas' },
      ], // Total BAST: 95 L, Net Farm: 153 L, Sisa: 58 L
    },
    {
      day: 3,
      pagiGross: 100,
      pagiPedet: 8,
      pagiAfkir: 1,
      soreGross: 80,
      sorePedet: 7,
      soreAfkir: 1,
      basts: [
        { type: 'PENJUALAN_LANGSUNG', dest: 'Mitra SPPG', vol: 55, num: '001', note: 'Pasokan SPPG' },
        { type: 'PENJUALAN_LANGSUNG', dest: 'Kantin Eduwisata', vol: 35, num: '002', note: 'Penjualan ke kantin eduwisata' },
        { type: 'PENJUALAN_LANGSUNG', dest: 'Konsumen Umum (Pak Ahmad)', vol: 20, num: '003', note: 'Penjualan langsung eceran' },
        { type: 'HIBAH', dest: 'Kegiatan Edukasi Siswa SD', vol: 10, num: '004', note: 'Hibah program minum susu edukasi' },
      ], // Total BAST: 120 L, Net Farm: 163 L, Sisa: 43 L
    },
    {
      day: 4,
      pagiGross: 105,
      pagiPedet: 8,
      pagiAfkir: 1,
      soreGross: 85,
      sorePedet: 8,
      soreAfkir: 1,
      basts: [
        { type: 'PENJUALAN_LANGSUNG', dest: 'Mitra SPPG', vol: 70, num: '001', note: 'Pasokan SPPG' },
        { type: 'PENJUALAN_LANGSUNG', dest: 'Kantin Eduwisata', vol: 40, num: '002', note: 'Penjualan kantin' },
        { type: 'HIBAH', dest: 'Panti Asuhan Al-Hikmah', vol: 20, num: '003', note: 'Penyaluran santunan panti asuhan' },
      ], // Total BAST: 130 L, Net Farm: 172 L, Sisa: 42 L
    },
    {
      day: 5,
      pagiGross: 110,
      pagiPedet: 8,
      pagiAfkir: 2,
      soreGross: 90,
      sorePedet: 7,
      soreAfkir: 1,
      basts: [
        { type: 'PENJUALAN_LANGSUNG', dest: 'Mitra SPPG', vol: 80, num: '001', note: 'Pasokan rutin SPPG' },
        { type: 'PENJUALAN_LANGSUNG', dest: 'Kantin Eduwisata', vol: 30, num: '002', note: 'Penjualan eduwisata' },
        { type: 'HIBAH', dest: 'Posyandu Melati Baturraden', vol: 15, num: '003', note: 'Hibah pencegahan stunting posyandu' },
      ], // Total BAST: 125 L, Net Farm: 182 L, Sisa: 57 L
    },
    {
      day: 6,
      pagiGross: 115,
      pagiPedet: 8,
      pagiAfkir: 1,
      soreGross: 95,
      sorePedet: 8,
      soreAfkir: 1,
      basts: [
        { type: 'PENJUALAN_LANGSUNG', dest: 'Mitra SPPG', vol: 85, num: '001', note: 'Pasokan SPPG' },
        { type: 'PENJUALAN_LANGSUNG', dest: 'Konsumen Umum', vol: 25, num: '002', note: 'Penjualan umum' },
        { type: 'HIBAH', dest: 'Yayasan Sosial Kasih Ibu', vol: 20, num: '003', note: 'Hibah sosial' },
      ], // Total BAST: 130 L, Net Farm: 192 L, Sisa: 62 L
    },
    {
      day: 7,
      pagiGross: 120,
      pagiPedet: 8,
      pagiAfkir: 2,
      soreGross: 100,
      sorePedet: 7,
      soreAfkir: 1,
      basts: [
        { type: 'PENJUALAN_LANGSUNG', dest: 'Mitra SPPG', vol: 90, num: '001', note: 'Pasokan SPPG' },
        { type: 'PENJUALAN_LANGSUNG', dest: 'Kantin Eduwisata', vol: 35, num: '002', note: 'Penjualan kantin' },
        { type: 'PENJUALAN_LANGSUNG', dest: 'Konsumen Umum', vol: 15, num: '003', note: 'Penjualan umum' },
        { type: 'HIBAH', dest: 'Tamu Kedinasan', vol: 10, num: '004', note: 'Hibah kedinasan' },
      ], // Total BAST: 150 L, Net Farm: 202 L, Sisa: 52 L
    },
  ];

  for (const s of sapiDailyScenarios) {
    const dayStr = s.day < 10 ? `0${s.day}` : `${s.day}`;
    const datePagi = new Date(`2026-09-${dayStr}T07:00:00.000Z`);
    const dateSore = new Date(`2026-09-${dayStr}T16:00:00.000Z`);
    const netPagi = s.pagiGross - s.pagiPedet - s.pagiAfkir;
    const netSore = s.soreGross - s.sorePedet - s.soreAfkir;

    // Insert Production Pagi Sapi
    await prisma.milkProduction.create({
      data: {
        date: datePagi,
        tanggal: datePagi,
        productType: 'SEGAR',
        animalType: 'SAPI',
        grossVolumeLiters: s.pagiGross,
        produksi: s.pagiGross,
        pedetVolumeLiters: s.pagiPedet,
        setorPedet: s.pagiPedet,
        afkirVolumeLiters: s.pagiAfkir,
        rusakAfkir: s.pagiAfkir,
        rawVolumeLiters: netPagi,
        kirimKePI: netPagi,
        processedLiters: netPagi,
        notes: `Pemerahan Pagi Sapi Perah Kandang A tgl ${s.day} Sept 2026`,
        createdById: farmId,
      },
    });

    // Insert Production Sore Sapi
    await prisma.milkProduction.create({
      data: {
        date: dateSore,
        tanggal: dateSore,
        productType: 'SEGAR',
        animalType: 'SAPI',
        grossVolumeLiters: s.soreGross,
        produksi: s.soreGross,
        pedetVolumeLiters: s.sorePedet,
        setorPedet: s.sorePedet,
        afkirVolumeLiters: s.soreAfkir,
        rusakAfkir: s.soreAfkir,
        rawVolumeLiters: netSore,
        kirimKePI: netSore,
        processedLiters: netSore,
        notes: `Pemerahan Sore Sapi Perah Kandang A tgl ${s.day} Sept 2026`,
        createdById: farmId,
      },
    });

    // Insert BAST Documents for Sapi
    for (const b of s.basts) {
      const nomorBast = `BAST/PEMASARAN/202609${dayStr}/${b.num}`;
      const d = new Date(`2026-09-${dayStr}T09:00:00.000Z`);
      await prisma.bastDocument.create({
        data: {
          nomorBast,
          tanggal: d,
          sumber: 'SUSU_SAPI',
          volumeLiters: b.vol,
          jenisPermintaan: b.type,
          instansiPenerima: b.dest,
          pengirimNama: 'Admin Pemasaran',
          pengirimRole: 'ADMIN_PEMASARAN',
          penerimaNama: 'Unit Farm Produksi BBPTUHPT',
          penerimaRole: 'ADMIN_FARM',
          status: 'DIKIRIM_KE_FARM',
          catatan: b.note,
          createdById: pemasaranId,
        },
      });
    }
  }

  // 2. Data Scenario Susu Kambing (1 - 7 September 2026)
  const kambingDailyScenarios = [
    {
      day: 1,
      pagiGross: 30,
      pagiPedet: 3,
      pagiAfkir: 1,
      soreGross: 20,
      sorePedet: 2,
      soreAfkir: 0,
      basts: [
        { type: 'PENJUALAN_LANGSUNG', dest: 'Kantin Eduwisata', vol: 15, num: '201', note: 'Distribusi Susu Kambing untuk pengunjung eduwisata' },
        { type: 'HIBAH', dest: 'Posyandu Herbal Desa', vol: 5, num: '202', note: 'Penyaluran hibah susu kambing untuk lansia' },
      ], // Total BAST: 20 L, Net Farm: 44 L, Sisa: 24 L
    },
    {
      day: 2,
      pagiGross: 32,
      pagiPedet: 3,
      pagiAfkir: 1,
      soreGross: 23,
      sorePedet: 2,
      soreAfkir: 0,
      basts: [
        { type: 'PENJUALAN_LANGSUNG', dest: 'Mitra SPPG', vol: 20, num: '201', note: 'Pasokan Susu Kambing segar ke SPPG' },
        { type: 'PENJUALAN_LANGSUNG', dest: 'Konsumen Umum (Pak H. Salim)', vol: 10, num: '202', note: 'Penjualan langsung susu kambing murni' },
      ], // Total BAST: 30 L, Net Farm: 49 L, Sisa: 19 L
    },
    {
      day: 3,
      pagiGross: 35,
      pagiPedet: 3,
      pagiAfkir: 1,
      soreGross: 25,
      sorePedet: 3,
      soreAfkir: 0,
      basts: [
        { type: 'PENJUALAN_LANGSUNG', dest: 'Kantin Eduwisata', vol: 20, num: '201', note: 'Penjualan Susu Kambing eduwisata' },
        { type: 'PENJUALAN_LANGSUNG', dest: 'Konsumen Khusus (Ibu Dian)', vol: 10, num: '202', note: 'Penjualan susu kambing kesehatan' },
        { type: 'HIBAH', dest: 'Tamu Kedinasan', vol: 5, num: '203', note: 'Hibah cenderamata susu kambing segar' },
      ], // Total BAST: 35 L, Net Farm: 53 L, Sisa: 18 L
    },
    {
      day: 4,
      pagiGross: 36,
      pagiPedet: 3,
      pagiAfkir: 1,
      soreGross: 26,
      sorePedet: 3,
      soreAfkir: 0,
      basts: [
        { type: 'PENJUALAN_LANGSUNG', dest: 'Mitra SPPG', vol: 25, num: '201', note: 'Pasokan susu kambing SPPG' },
        { type: 'HIBAH', dest: 'Yayasan Peduli Lansia', vol: 10, num: '202', note: 'Hibah susu kambing untuk panti lansia' },
      ], // Total BAST: 35 L, Net Farm: 55 L, Sisa: 20 L
    },
    {
      day: 5,
      pagiGross: 38,
      pagiPedet: 4,
      pagiAfkir: 1,
      soreGross: 28,
      sorePedet: 3,
      soreAfkir: 0,
      basts: [
        { type: 'PENJUALAN_LANGSUNG', dest: 'Mitra SPPG', vol: 25, num: '201', note: 'Pasokan susu kambing' },
        { type: 'PENJUALAN_LANGSUNG', dest: 'Kantin Eduwisata', vol: 15, num: '202', note: 'Penjualan eduwisata' },
        { type: 'HIBAH', dest: 'Posyandu Terpadu', vol: 5, num: '203', note: 'Hibah posyandu' },
      ], // Total BAST: 45 L, Net Farm: 58 L, Sisa: 13 L
    },
    {
      day: 6,
      pagiGross: 40,
      pagiPedet: 4,
      pagiAfkir: 1,
      soreGross: 30,
      sorePedet: 3,
      soreAfkir: 0,
      basts: [
        { type: 'PENJUALAN_LANGSUNG', dest: 'Mitra SPPG', vol: 30, num: '201', note: 'Pasokan susu kambing' },
        { type: 'PENJUALAN_LANGSUNG', dest: 'Konsumen Umum', vol: 15, num: '202', note: 'Penjualan umum' },
      ], // Total BAST: 45 L, Net Farm: 62 L, Sisa: 17 L
    },
    {
      day: 7,
      pagiGross: 42,
      pagiPedet: 4,
      pagiAfkir: 1,
      soreGross: 32,
      sorePedet: 3,
      soreAfkir: 0,
      basts: [
        { type: 'PENJUALAN_LANGSUNG', dest: 'Mitra SPPG', vol: 35, num: '201', note: 'Pasokan susu kambing' },
        { type: 'PENJUALAN_LANGSUNG', dest: 'Kantin Eduwisata', vol: 15, num: '202', note: 'Penjualan kantin' },
        { type: 'HIBAH', dest: 'Kegiatan Sosial', vol: 5, num: '203', note: 'Hibah sosial' },
      ], // Total BAST: 55 L, Net Farm: 66 L, Sisa: 11 L
    },
  ];

  for (const k of kambingDailyScenarios) {
    const dayStr = k.day < 10 ? `0${k.day}` : `${k.day}`;
    const datePagi = new Date(`2026-09-${dayStr}T07:30:00.000Z`);
    const dateSore = new Date(`2026-09-${dayStr}T16:30:00.000Z`);
    const netPagi = k.pagiGross - k.pagiPedet - k.pagiAfkir;
    const netSore = k.soreGross - k.sorePedet - k.soreAfkir;

    // Insert Production Pagi Kambing
    await prisma.milkProduction.create({
      data: {
        date: datePagi,
        tanggal: datePagi,
        productType: 'SEGAR',
        animalType: 'KAMBING',
        grossVolumeLiters: k.pagiGross,
        produksi: k.pagiGross,
        pedetVolumeLiters: k.pagiPedet,
        setorPedet: k.pagiPedet,
        afkirVolumeLiters: k.pagiAfkir,
        rusakAfkir: k.pagiAfkir,
        rawVolumeLiters: netPagi,
        kirimKePI: netPagi,
        processedLiters: netPagi,
        notes: `Pemerahan Pagi Susu Kambing Perah Kandang B tgl ${k.day} Sept 2026`,
        createdById: farmId,
      },
    });

    // Insert Production Sore Kambing
    await prisma.milkProduction.create({
      data: {
        date: dateSore,
        tanggal: dateSore,
        productType: 'SEGAR',
        animalType: 'KAMBING',
        grossVolumeLiters: k.soreGross,
        produksi: k.soreGross,
        pedetVolumeLiters: k.sorePedet,
        setorPedet: k.sorePedet,
        afkirVolumeLiters: k.soreAfkir,
        rusakAfkir: k.soreAfkir,
        rawVolumeLiters: netSore,
        kirimKePI: netSore,
        processedLiters: netSore,
        notes: `Pemerahan Sore Susu Kambing Perah Kandang B tgl ${k.day} Sept 2026`,
        createdById: farmId,
      },
    });

    // Insert BAST Documents for Kambing
    for (const b of k.basts) {
      const nomorBast = `BAST/PEMASARAN/202609${dayStr}/${b.num}`;
      const d = new Date(`2026-09-${dayStr}T09:30:00.000Z`);
      await prisma.bastDocument.create({
        data: {
          nomorBast,
          tanggal: d,
          sumber: 'SUSU_KAMBING',
          volumeLiters: b.vol,
          jenisPermintaan: b.type,
          instansiPenerima: b.dest,
          pengirimNama: 'Admin Pemasaran',
          pengirimRole: 'ADMIN_PEMASARAN',
          penerimaNama: 'Unit Farm Produksi BBPTUHPT',
          penerimaRole: 'ADMIN_FARM',
          status: 'DIKIRIM_KE_FARM',
          catatan: b.note,
          createdById: pemasaranId,
        },
      });
    }
  }

  console.log('✅ Berhasil membuat data dummy distribusi untuk Susu Sapi & Susu Kambing dengan sisa stok belum terjual!');
  process.exit(0);
}

seedDistribusiDummy().catch((e) => {
  console.error('Error seeding data:', e);
  process.exit(1);
});
