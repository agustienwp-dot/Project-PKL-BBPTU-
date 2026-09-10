import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PEMASARAN', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Peran tidak diizinkan.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sumber = searchParams.get('sumber'); // FRESH / OLAHAN
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause = {};
    if (sumber) {
      whereClause.sumber = sumber.toUpperCase();
    }
    if (startDate || endDate) {
      whereClause.tanggal = {};
      if (startDate) whereClause.tanggal.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.tanggal.lte = end;
      }
    }

    const sales = await prisma.milkSale.findMany({
      where: whereClause,
      orderBy: { tanggal: 'desc' },
      include: {
        piutang: {
          include: {
            pelunasanPiutang: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengambil daftar penjualan susu.',
      data: sales,
    });
  } catch (error) {
    console.error('Error GET /api/milk-sales:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data penjualan susu.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PEMASARAN', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Peran tidak diizinkan.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      tanggal,
      sumber = 'FRESH',
      produkRefId = null,
      jumlah = 0,
      pembeli = '',
      hargaJual = 0,
      kategoriBayar = 'PNBP',
      catatan = '',
    } = body;

    const numJumlah = parseFloat(jumlah);
    const numHargaJual = parseFloat(hargaJual);

    if (!pembeli || !pembeli.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama pembeli wajib diisi.' },
        { status: 400 }
      );
    }

    if (isNaN(numJumlah) || numJumlah <= 0) {
      return NextResponse.json(
        { success: false, message: 'Jumlah (volume/unit) harus lebih dari 0.' },
        { status: 400 }
      );
    }

    if (isNaN(numHargaJual) || numHargaJual < 0) {
      return NextResponse.json(
        { success: false, message: 'Harga jual harus bernilai valid (>= 0).' },
        { status: 400 }
      );
    }

    // Execute transaction to check stock and record sale + piutang atomically
    const newSale = await prisma.$transaction(async (tx) => {
      // 1. Calculate available stock
      if (sumber.toUpperCase() === 'FRESH') {
        const productions = await tx.milkProduction.findMany();
        const totalStockPI = productions.reduce((acc, p) => {
          const val = p.kirimKePI || p.rawVolumeLiters || Math.max(0, (p.produksi || p.grossVolumeLiters || 0) - (p.setorPedet || p.pedetVolumeLiters || 0) - (p.rusakAfkir || p.afkirVolumeLiters || 0));
          return acc + val;
        }, 0);

        const existingSalesFresh = await tx.milkSale.findMany({
          where: { sumber: 'FRESH' },
        });
        const totalSoldFresh = existingSalesFresh.reduce((acc, s) => acc + (s.jumlah || s.quantity || 0), 0);

        const availableFresh = totalStockPI - totalSoldFresh;

        if (numJumlah > availableFresh) {
          throw new Error(`Stok susu fresh tidak mencukupi. Tersedia: ${availableFresh.toFixed(1)} Liter, Diminta: ${numJumlah} Liter.`);
        }
      } else if (sumber.toUpperCase() === 'OLAHAN') {
        if (!produkRefId) {
          throw new Error('Pilih produk olahan yang valid.');
        }

        const product = await tx.packagedProduct.findUnique({
          where: { id: produkRefId },
        });

        let totalStockProduct = 0;
        if (product) {
          if (product.status !== 'DITERIMA') {
            throw new Error(`Produk olahan (${product.jenisProduk} - ${product.kemasan}) belum dikonfirmasi DITERIMA oleh Admin Pemasaran.`);
          }
          totalStockProduct = product.jumlah;
        } else {
          // Check in legacy MilkPackaging
          const legacyPkg = await tx.milkPackaging.findUnique({
            where: { id: produkRefId },
          });
          if (!legacyPkg) {
            throw new Error('Produk olahan tidak ditemukan.');
          }
          if (legacyPkg.status !== 'DITERIMA') {
            throw new Error('Produk olahan ini belum dikonfirmasi DITERIMA oleh Admin Pemasaran.');
          }
          totalStockProduct = legacyPkg.totalPackagedQty || legacyPkg.quantityReceived || 0;
        }

        const existingSalesOlahan = await tx.milkSale.findMany({
          where: { produkRefId: produkRefId },
        });
        const totalSoldOlahan = existingSalesOlahan.reduce((acc, s) => acc + (s.jumlah || s.quantity || 0), 0);

        const availableOlahan = totalStockProduct - totalSoldOlahan;

        if (numJumlah > availableOlahan) {
          throw new Error(`Stok produk olahan tidak mencukupi. Tersedia: ${availableOlahan} Pcs, Diminta: ${numJumlah} Pcs.`);
        }
      }

      // Generate transactionId
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const transactionId = `TRX-${dateStr}-${randomSuffix}`;

      const saleDate = tanggal ? new Date(tanggal) : new Date();

      // 2. Create MilkSale record
      const createdSale = await tx.milkSale.create({
        data: {
          transactionId,
          tanggal: saleDate,
          date: saleDate,
          sumber: sumber.toUpperCase(),
          produkRefId: produkRefId || null,
          jumlah: numJumlah,
          quantity: Math.round(numJumlah),
          pembeli: pembeli.trim(),
          hargaJual: numHargaJual,
          totalPrice: numHargaJual,
          kategoriBayar: kategoriBayar.toUpperCase() === 'PIUTANG' ? 'PIUTANG' : 'PNBP',
          catatan: catatan ? catatan.trim() : null,
          notes: catatan ? catatan.trim() : null,
          createdById: authUser.userId || authUser.id || null,
        },
      });

      // 3. If PIUTANG, create Piutang record
      if (kategoriBayar.toUpperCase() === 'PIUTANG') {
        await tx.piutang.create({
          data: {
            milkSaleId: createdSale.id,
            jumlahAwal: numHargaJual,
            sisaPiutang: numHargaJual,
            lunas: false,
          },
        });
      }

      return createdSale;
    });

    return NextResponse.json({
      success: true,
      message: 'Berhasil mencatat transaksi penjualan susu.',
      data: newSale,
    });
  } catch (error) {
    console.error('Error POST /api/milk-sales:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mencatat transaksi penjualan susu.' },
      { status: 400 }
    );
  }
}
