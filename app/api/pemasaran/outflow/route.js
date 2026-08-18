import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const productType = searchParams.get('productType');
    const date = searchParams.get('date');

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (productType) where.productType = productType;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const outflows = await prisma.milkOutflow.findMany({
      where,
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data: outflows });
  } catch (error) {
    console.error('GET /api/pemasaran/outflow error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_PEMASARAN' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Pemasaran atau Superadmin yang dapat menginput pengeluaran stok' }, { status: 403 });
    }

    const { date, categoryId, code, productType, packagingType, quantity, notes, destination } = await request.json();

    const qtyNumber = parseInt(quantity, 10);
    if (!qtyNumber || qtyNumber <= 0) {
      return NextResponse.json({ success: false, message: 'Jumlah pengeluaran harus berupa angka lebih dari 0' }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ success: false, message: 'Tanggal pengeluaran wajib diisi' }, { status: 400 });
    }

    let targetCategory = null;
    if (categoryId) {
      targetCategory = await prisma.milkCategory.findUnique({ where: { id: categoryId } });
    } else {
      // Find default or first available category
      targetCategory = await prisma.milkCategory.findFirst();
    }

    if (!targetCategory) {
      // Fallback fallback category
      targetCategory = await prisma.milkCategory.create({
        data: {
          name: 'Susu Murni Segar (MYPI)',
          code: 'MYPI',
          productType: 'SEGAR',
          animalType: 'SAPI',
          defaultPackaging: 'botol',
        }
      });
    }

    const itemCode = code || targetCategory.code || 'MYPI';
    const destinationNote = destination || notes || 'Pengeluaran Stok';
    const combinedNotes = `[${itemCode}] ${destinationNote}`;

    const outflow = await prisma.milkOutflow.create({
      data: {
        date: date ? new Date(date) : new Date(),
        categoryId: targetCategory.id,
        productType: productType || targetCategory.productType || 'SEGAR',
        packagingType: packagingType || targetCategory.defaultPackaging || 'botol',
        quantity: qtyNumber,
        notes: combinedNotes,
        createdById: authUser.id,
      },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await prisma.systemLog.create({
      data: {
        userId: authUser.id,
        userEmail: authUser.email,
        action: 'CREATE_OUTFLOW',
        details: `Input produk keluar (${itemCode}): ${qtyNumber} pcs — ${destinationNote}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Pengeluaran ${qtyNumber} pcs untuk Keterangan Susu (${itemCode}) berhasil dicatat. Stok otomatis berkurang.`,
      data: outflow,
    });
  } catch (error) {
    console.error('POST /api/pemasaran/outflow error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
