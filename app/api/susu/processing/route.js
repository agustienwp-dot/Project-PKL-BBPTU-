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

    const list = await prisma.milkProcessing.findMany({
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error('GET /api/susu/processing error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { rawMilkUsedLiters, botolOutputQty, cupOutputQty, bantalOutputQty, notes, date } = await request.json();

    if (!rawMilkUsedLiters || parseFloat(rawMilkUsedLiters) <= 0) {
      return NextResponse.json({ success: false, message: 'Jumlah susu mentah yang diolah (Liter) harus berupa angka positif' }, { status: 400 });
    }

    const usedLiters = parseFloat(rawMilkUsedLiters);

    // Calculate current available raw milk stock
    const [totalReceivedAgg, totalUsedAgg] = await Promise.all([
      prisma.milkReception.aggregate({ _sum: { volumeLiters: true } }),
      prisma.milkProcessing.aggregate({ _sum: { rawMilkUsedLiters: true } }),
    ]);

    const totalIn = totalReceivedAgg._sum.volumeLiters || 0;
    const totalOut = totalUsedAgg._sum.rawMilkUsedLiters || 0;
    const currentRawStock = totalIn - totalOut;

    // Validation: prevent negative raw milk stock
    if (usedLiters > currentRawStock) {
      return NextResponse.json({
        success: false,
        message: `Stok susu mentah tidak mencukupi! Stok tersedia: ${currentRawStock} Liter, diminta untuk diolah: ${usedLiters} Liter.`,
      }, { status: 400 });
    }

    const newRecord = await prisma.milkProcessing.create({
      data: {
        rawMilkUsedLiters: usedLiters,
        botolOutputQty: parseInt(botolOutputQty || '0', 10),
        cupOutputQty: parseInt(cupOutputQty || '0', 10),
        bantalOutputQty: parseInt(bantalOutputQty || '0', 10),
        notes: notes || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pencatatan pengolahan susu & output 3 jenis kemasan berhasil disimpan!',
      data: newRecord,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/susu/processing error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
