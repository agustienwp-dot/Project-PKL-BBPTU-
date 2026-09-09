import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PEMASARAN', 'SUPERADMIN', 'ADMIN_FARM'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Peran tidak diizinkan.' },
        { status: 403 }
      );
    }

    const productions = await prisma.milkProduction.findMany({
      orderBy: { date: 'desc' },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Compute derived/compat fields for each record if missing
    const formatted = productions.map((item) => {
      const produksiVal = item.produksi || item.grossVolumeLiters || 0;
      const setorPedetVal = item.setorPedet || item.pedetVolumeLiters || 0;
      const rusakAfkirVal = item.rusakAfkir || item.afkirVolumeLiters || 0;
      const kirimKePIVal = item.kirimKePI || item.rawVolumeLiters || Math.max(0, produksiVal - setorPedetVal - rusakAfkirVal);

      return {
        ...item,
        tanggal: item.tanggal || item.date,
        produksi: produksiVal,
        setorPedet: setorPedetVal,
        rusakAfkir: rusakAfkirVal,
        kirimKePI: kirimKePIVal,
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengambil data produksi susu.',
      data: formatted,
    });
  } catch (error) {
    console.error('Error GET /api/milk-production:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data produksi susu.' },
      { status: 500 }
    );
  }
}
