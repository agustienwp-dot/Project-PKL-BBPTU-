import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/pemasaran/dashboard
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. All Accepted Packagings
    const acceptedPackagings = await prisma.milkPackaging.findMany({
      where: { status: 'DITERIMA' },
    });

    // 2. All Outflows & Sales
    const outflows = await prisma.milkOutflow.findMany();
    const sales = await prisma.milkSale.findMany({
      where: { status: 'Berhasil' },
    });

    // Calculate total accepted quantity across all DITERIMA packagings
    let totalReceivedQty = 0;
    const packagingStockMap = { botol: 0, cup: 0, pack: 0 };

    acceptedPackagings.forEach((pkg) => {
      const qty = pkg.quantityReceived || pkg.totalPackagedQty || 0;
      totalReceivedQty += qty;

      let items = [];
      if (pkg.packagingDetails) {
        try {
          const parsed = JSON.parse(pkg.packagingDetails);
          if (Array.isArray(parsed)) items = parsed;
        } catch (e) {}
      }

      if (items.length > 0) {
        items.forEach((it) => {
          const t = (it.packagingType || '').toLowerCase();
          const q = parseInt(it.quantity, 10) || 0;
          if (t.includes('cup')) packagingStockMap.cup += q;
          else if (t.includes('bantal') || t.includes('pack')) packagingStockMap.pack += q;
          else packagingStockMap.botol += q;
        });
      } else {
        packagingStockMap.botol += pkg.botolQty || 0;
        packagingStockMap.cup += pkg.cupQty || 0;
        packagingStockMap.pack += pkg.plastikBantalQty || 0;
      }
    });

    // Subtract outflows and sales
    let totalOutflowQty = 0;

    outflows.forEach((out) => {
      const t = (out.packagingType || '').toLowerCase();
      const q = out.quantity || 0;
      totalOutflowQty += q;
      if (t.includes('cup')) packagingStockMap.cup = Math.max(0, packagingStockMap.cup - q);
      else if (t.includes('pack') || t.includes('bantal')) packagingStockMap.pack = Math.max(0, packagingStockMap.pack - q);
      else packagingStockMap.botol = Math.max(0, packagingStockMap.botol - q);
    });

    sales.forEach((sale) => {
      const t = (sale.packagingType || '').toLowerCase();
      const q = sale.quantity || 0;
      totalOutflowQty += q;
      if (t.includes('cup')) packagingStockMap.cup = Math.max(0, packagingStockMap.cup - q);
      else if (t.includes('pack') || t.includes('bantal')) packagingStockMap.pack = Math.max(0, packagingStockMap.pack - q);
      else packagingStockMap.botol = Math.max(0, packagingStockMap.botol - q);
    });

    const totalReadyStock = Math.max(0, totalReceivedQty - totalOutflowQty);

    // 3. Sales statistics
    const todaySales = sales.filter((s) => s.date >= today && s.date <= endToday);
    const todaySalesCount = todaySales.length;
    const todaySalesUnits = todaySales.reduce((acc, s) => acc + (s.quantity || 0), 0);
    const todaySalesRevenue = todaySales.reduce((acc, s) => acc + (s.totalPrice || 0), 0);

    const monthlySales = sales.filter((s) => s.date >= firstDayOfMonth && s.date <= lastDayOfMonth);
    const monthlySalesRevenue = monthlySales.reduce((acc, s) => acc + (s.totalPrice || 0), 0);

    // 4. Low stock count (threshold < 20 pcs per packaging type)
    let lowStockCount = 0;
    Object.values(packagingStockMap).forEach((qty) => {
      if (qty > 0 && qty < 20) lowStockCount++;
    });

    // 5. Pending notifications count
    const pendingPackagings = await prisma.milkPackaging.findMany({
      where: { status: 'MENUNGGU_PENERIMAAN' },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { name: true } },
      },
    });

    const pendingNotificationsCount = pendingPackagings.length;

    // 6. Recent sales (top 5)
    const recentTransactions = await prisma.milkSale.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        createdBy: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalReadyStock,
        todaySalesCount,
        todaySalesUnits,
        todaySalesRevenue,
        monthlySalesRevenue,
        lowStockCount,
        pendingNotificationsCount,
        pendingPackagings,
        packagingStockMap,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('GET /api/pemasaran/dashboard error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
