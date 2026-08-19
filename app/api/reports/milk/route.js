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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sumber = searchParams.get('sumber');

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
            pelunasan: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const totalSalesCount = sales.length;
    const totalVolumeSold = sales.reduce((acc, s) => acc + (s.jumlah || s.quantity || 0), 0);
    const totalOmzet = sales.reduce((acc, s) => acc + (s.hargaJual || s.totalPrice || 0), 0);

    const freshSales = sales.filter((s) => s.sumber === 'FRESH');
    const olahanSales = sales.filter((s) => s.sumber === 'OLAHAN');

    const totalFreshVolume = freshSales.reduce((acc, s) => acc + (s.jumlah || 0), 0);
    const totalFreshOmzet = freshSales.reduce((acc, s) => acc + (s.hargaJual || 0), 0);

    const totalOlahanQty = olahanSales.reduce((acc, s) => acc + (s.jumlah || 0), 0);
    const totalOlahanOmzet = olahanSales.reduce((acc, s) => acc + (s.hargaJual || 0), 0);

    const pnbpSales = sales.filter((s) => s.kategoriBayar === 'PNBP');
    const piutangSales = sales.filter((s) => s.kategoriBayar === 'PIUTANG');

    const totalPNBPOmzet = pnbpSales.reduce((acc, s) => acc + (s.hargaJual || 0), 0);
    const totalPiutangOmzet = piutangSales.reduce((acc, s) => acc + (s.hargaJual || 0), 0);
    const totalSisaPiutang = piutangSales.reduce((acc, s) => acc + (s.piutang ? s.piutang.sisaPiutang : 0), 0);
    const totalPiutangLunas = piutangSales.reduce((acc, s) => acc + (s.piutang && s.piutang.lunas ? (s.hargaJual || 0) : ((s.hargaJual || 0) - (s.piutang?.sisaPiutang || 0))), 0);

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengambil laporan penjualan susu.',
      data: {
        summary: {
          totalSalesCount,
          totalVolumeSold,
          totalOmzet,
          totalFreshVolume,
          totalFreshOmzet,
          totalOlahanQty,
          totalOlahanOmzet,
          totalPNBPOmzet,
          totalPiutangOmzet,
          totalSisaPiutang,
          totalPiutangLunas,
        },
        sales,
      },
    });
  } catch (error) {
    console.error('Error GET /api/reports/milk:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil laporan penjualan susu.' },
      { status: 500 }
    );
  }
}
