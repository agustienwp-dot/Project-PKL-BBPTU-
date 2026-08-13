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

    const list = await prisma.milkDistribution.findMany({
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error('GET /api/susu/distribution error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { destination, botolQty, cupQty, bantalQty, notes, date } = await request.json();

    if (!destination) {
      return NextResponse.json({ success: false, message: 'Tujuan pengiriman / pemasaran wajib diisi' }, { status: 400 });
    }

    const reqBotol = parseInt(botolQty || '0', 10);
    const reqCup = parseInt(cupQty || '0', 10);
    const reqBantal = parseInt(bantalQty || '0', 10);

    if (reqBotol === 0 && reqCup === 0 && reqBantal === 0) {
      return NextResponse.json({ success: false, message: 'Masukkan minimal 1 jumlah kemasan susu yang didistribusikan' }, { status: 400 });
    }

    // Calculate current available stock for each packaging type
    const [procAgg, distAgg] = await Promise.all([
      prisma.milkProcessing.aggregate({
        _sum: { botolOutputQty: true, cupOutputQty: true, bantalOutputQty: true },
      }),
      prisma.milkDistribution.aggregate({
        _sum: { botolQty: true, cupQty: true, bantalQty: true },
      }),
    ]);

    const availBotol = (procAgg._sum.botolOutputQty || 0) - (distAgg._sum.botolQty || 0);
    const availCup = (procAgg._sum.cupOutputQty || 0) - (distAgg._sum.cupQty || 0);
    const availBantal = (procAgg._sum.bantalOutputQty || 0) - (distAgg._sum.bantalQty || 0);

    // Validation: prevent negative stock per packaging
    if (reqBotol > availBotol) {
      return NextResponse.json({ success: false, message: `Stok Botol tidak mencukupi! Tersedia: ${availBotol} pcs, diminta: ${reqBotol} pcs.` }, { status: 400 });
    }
    if (reqCup > availCup) {
      return NextResponse.json({ success: false, message: `Stok Cup tidak mencukupi! Tersedia: ${availCup} pcs, diminta: ${reqCup} pcs.` }, { status: 400 });
    }
    if (reqBantal > availBantal) {
      return NextResponse.json({ success: false, message: `Stok Plastik Bantal tidak mencukupi! Tersedia: ${availBantal} pcs, diminta: ${reqBantal} pcs.` }, { status: 400 });
    }

    const newDist = await prisma.milkDistribution.create({
      data: {
        destination,
        botolQty: reqBotol,
        cupQty: reqCup,
        bantalQty: reqBantal,
        notes: notes || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Distribusi susu ke ${destination} berhasil dicatat!`,
      data: newDist,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/susu/distribution error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
