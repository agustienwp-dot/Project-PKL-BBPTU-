import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // "01" - "12"
    const year = searchParams.get('year');   // e.g. "2026"
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const where = {};

    if (startDateParam || endDateParam) {
      where.date = {};
      if (startDateParam) where.date.gte = new Date(startDateParam);
      if (endDateParam) {
        const end = new Date(endDateParam);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    } else if (year || month) {
      const targetYear = parseInt(year || new Date().getFullYear(), 10);
      if (month) {
        const targetMonth = parseInt(month, 10) - 1; // 0-indexed
        const start = new Date(targetYear, targetMonth, 1);
        const end = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
        where.date = { gte: start, lte: end };
      } else {
        const start = new Date(targetYear, 0, 1);
        const end = new Date(targetYear, 11, 31, 23, 59, 59, 999);
        where.date = { gte: start, lte: end };
      }
    }

    const dailyOutflows = await prisma.dailyMilkOutflow.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Compute metrics
    const formattedData = dailyOutflows.map((item, index) => {
      const dateObj = new Date(item.date);
      const tgl = String(dateObj.getDate()).padStart(2, '0');
      const bln = String(dateObj.getMonth() + 1).padStart(2, '0');
      const thn = String(dateObj.getFullYear());

      return {
        id: item.id,
        no: dailyOutflows.length - index,
        rawDate: item.date,
        tgl,
        bln,
        thn,
        formattedDate: `${tgl}/${bln}/${thn}`,
        mypi: item.mypi || 0,
        hs: item.hs || 0,
        ht: item.ht || 0,
        os: item.os || 0,
        js: item.js || 0,
        jsPnb: item.jsPnb || 0,
        bs: item.bs || 0,
        jlb: item.jlb || 0,
        blb: item.blb || 0,
        totalKeluarHariIni: (item.mypi || 0) + (item.hs || 0) + (item.ht || 0) + (item.os || 0) + (item.js || 0) + (item.jsPnb || 0) + (item.bs || 0) + (item.jlb || 0) + (item.blb || 0),
        stockAkhir: item.stockAkhir || 0,
        penambahanPiutang: item.penambahanPiutang || 0,
        penguranganPiutang: item.penguranganPiutang || 0,
        sisaPiutang: item.sisaPiutang || 0,
        notes: item.notes || '',
        createdBy: item.createdBy?.name || 'Admin Pemasaran',
      };
    });

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error) {
    console.error('GET /api/pemasaran/daily-outflow error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_PEMASARAN' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Pemasaran atau Superadmin yang dapat menginput rekap harian' }, { status: 403 });
    }

    const body = await request.json();
    const { date, mypi, hs, ht, os, js, jsPnb, bs, jlb, blb, penambahanPiutang, penguranganPiutang, notes } = body;

    if (!date) {
      return NextResponse.json({ success: false, message: 'Tanggal rekap harian wajib diisi' }, { status: 400 });
    }

    const targetDate = new Date(date);
    targetDate.setHours(12, 0, 0, 0); // Normalized time

    const numMypi = parseInt(mypi || 0, 10);
    const numHs = parseInt(hs || 0, 10);
    const numHt = parseInt(ht || 0, 10);
    const numOs = parseInt(os || 0, 10);
    const numJs = parseInt(js || 0, 10);
    const numJsPnb = parseInt(jsPnb || 0, 10);
    const numBs = parseInt(bs || 0, 10);
    const numJlb = parseInt(jlb || 0, 10);
    const numBlb = parseInt(blb || 0, 10);

    const numPenambahanPiutang = parseInt(penambahanPiutang || 0, 10);
    const numPenguranganPiutang = parseInt(penguranganPiutang || 0, 10);

    const totalKeluar = numMypi + numHs + numHt + numOs + numJs + numJsPnb + numBs + numJlb + numBlb;

    // Fetch accepted packagings total to compute live stockAkhir
    const acceptedPackagings = await prisma.milkPackaging.aggregate({
      where: { status: 'DITERIMA' },
      _sum: { quantityReceived: true },
    });
    const totalReceived = acceptedPackagings._sum.quantityReceived || 0;

    // Fetch previous daily outflows total
    const previousOutflows = await prisma.dailyMilkOutflow.aggregate({
      where: {
        date: { lt: targetDate }
      },
      _sum: {
        mypi: true, hs: true, ht: true, os: true, js: true, jsPnb: true, bs: true, jlb: true, blb: true
      }
    });

    const prevOutTotal = (previousOutflows._sum.mypi || 0) + (previousOutflows._sum.hs || 0) + (previousOutflows._sum.ht || 0) + 
      (previousOutflows._sum.os || 0) + (previousOutflows._sum.js || 0) + (previousOutflows._sum.jsPnb || 0) + 
      (previousOutflows._sum.bs || 0) + (previousOutflows._sum.jlb || 0) + (previousOutflows._sum.blb || 0);

    const computedStockAkhir = Math.max(0, totalReceived - prevOutTotal - totalKeluar);
    const computedSisaPiutang = Math.max(0, numPenambahanPiutang - numPenguranganPiutang);

    // Upsert record for the date
    const record = await prisma.dailyMilkOutflow.upsert({
      where: { date: targetDate },
      update: {
        mypi: numMypi,
        hs: numHs,
        ht: numHt,
        os: numOs,
        js: numJs,
        jsPnb: numJsPnb,
        bs: numBs,
        jlb: numJlb,
        blb: numBlb,
        stockAkhir: computedStockAkhir,
        penambahanPiutang: numPenambahanPiutang,
        penguranganPiutang: numPenguranganPiutang,
        sisaPiutang: computedSisaPiutang,
        notes: notes || '',
        createdById: authUser.id,
      },
      create: {
        date: targetDate,
        mypi: numMypi,
        hs: numHs,
        ht: numHt,
        os: numOs,
        js: numJs,
        jsPnb: numJsPnb,
        bs: numBs,
        jlb: numJlb,
        blb: numBlb,
        stockAkhir: computedStockAkhir,
        penambahanPiutang: numPenambahanPiutang,
        penguranganPiutang: numPenguranganPiutang,
        sisaPiutang: computedSisaPiutang,
        notes: notes || '',
        createdById: authUser.id,
      },
    });

    await prisma.systemLog.create({
      data: {
        userId: authUser.id,
        userEmail: authUser.email,
        action: 'UPSERT_DAILY_OUTFLOW',
        details: `Input rekap produk keluar harian (${date}): total ${totalKeluar} pcs`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Rekap data pengeluaran harian tanggal ${new Date(date).toLocaleDateString('id-ID')} berhasil disimpan!`,
      data: record,
    });
  } catch (error) {
    console.error('POST /api/pemasaran/daily-outflow error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
