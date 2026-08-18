import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const feeds = await prisma.feedStock.findMany({
      orderBy: { quantityKg: 'asc' },
    });

    const criticalFeeds = feeds.filter((f) => f.quantityKg <= f.minStockKg);

    return NextResponse.json({
      success: true,
      data: {
        feeds,
        criticalCount: criticalFeeds.length,
        criticalFeeds,
      },
    });
  } catch (error) {
    console.error('GET /api/ternak/feed error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { name, category, quantityKg, minStockKg, unit, supplier } = await request.json();

    if (!name || !category || quantityKg === undefined) {
      return NextResponse.json({ success: false, message: 'Nama pakan, Kategori, dan Jumlah wajib diisi' }, { status: 400 });
    }

    const feed = await prisma.feedStock.upsert({
      where: { name },
      update: {
        quantityKg: parseFloat(quantityKg),
        minStockKg: minStockKg !== undefined ? parseFloat(minStockKg) : 50.0,
        supplier: supplier || null,
        lastRestocked: new Date(),
      },
      create: {
        name,
        category,
        quantityKg: parseFloat(quantityKg),
        minStockKg: minStockKg !== undefined ? parseFloat(minStockKg) : 50.0,
        unit: unit || 'kg',
        supplier: supplier || null,
      },
    });

    return NextResponse.json({ success: true, message: 'Stok pakan berhasil dicatat', data: feed }, { status: 201 });
  } catch (error) {
    console.error('POST /api/ternak/feed error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
