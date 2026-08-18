import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MONTH_NAMES = [
  '01 - Januari',
  '02 - Februari',
  '03 - Maret',
  '04 - April',
  '05 - Mei',
  '06 - Juni',
  '07 - Juli',
  '08 - Agustus',
  '09 - September',
  '10 - Oktober',
  '11 - November',
  '12 - Desember',
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear(), 10);

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    const records = await prisma.dailyMilkOutflow.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
    });

    // Initialize 12 months array
    const monthlyPivot = Array.from({ length: 12 }, (_, i) => ({
      monthCode: String(i + 1).padStart(2, '0'),
      monthName: MONTH_NAMES[i],
      sumMypi: 0,
      sumHs: 0,
      sumHt: 0,
      sumOs: 0,
      sumJs: 0,
      sumJsPnb: 0,
      sumBs: 0,
      sumJlb: 0,
      sumBlb: 0,
      sumPenambahanPiutang: 0,
      sumPenguranganPiutang: 0,
      totalKeluar: 0,
    }));

    // Aggregate values per month
    records.forEach((r) => {
      const monthIdx = new Date(r.date).getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        monthlyPivot[monthIdx].sumMypi += r.mypi || 0;
        monthlyPivot[monthIdx].sumHs += r.hs || 0;
        monthlyPivot[monthIdx].sumHt += r.ht || 0;
        monthlyPivot[monthIdx].sumOs += r.os || 0;
        monthlyPivot[monthIdx].sumJs += r.js || 0;
        monthlyPivot[monthIdx].sumJsPnb += r.jsPnb || 0;
        monthlyPivot[monthIdx].sumBs += r.bs || 0;
        monthlyPivot[monthIdx].sumJlb += r.jlb || 0;
        monthlyPivot[monthIdx].sumBlb += r.blb || 0;
        monthlyPivot[monthIdx].sumPenambahanPiutang += r.penambahanPiutang || 0;
        monthlyPivot[monthIdx].sumPenguranganPiutang += r.penguranganPiutang || 0;
        monthlyPivot[monthIdx].totalKeluar += 
          (r.mypi || 0) + (r.hs || 0) + (r.ht || 0) + (r.os || 0) + 
          (r.js || 0) + (r.jsPnb || 0) + (r.bs || 0) + (r.jlb || 0) + (r.blb || 0);
      }
    });

    // Compute Grand Total row
    const grandTotal = {
      label: 'Grand Total',
      sumMypi: monthlyPivot.reduce((acc, m) => acc + m.sumMypi, 0),
      sumHs: monthlyPivot.reduce((acc, m) => acc + m.sumHs, 0),
      sumHt: monthlyPivot.reduce((acc, m) => acc + m.sumHt, 0),
      sumOs: monthlyPivot.reduce((acc, m) => acc + m.sumOs, 0),
      sumJs: monthlyPivot.reduce((acc, m) => acc + m.sumJs, 0),
      sumJsPnb: monthlyPivot.reduce((acc, m) => acc + m.sumJsPnb, 0),
      sumBs: monthlyPivot.reduce((acc, m) => acc + m.sumBs, 0),
      sumJlb: monthlyPivot.reduce((acc, m) => acc + m.sumJlb, 0),
      sumBlb: monthlyPivot.reduce((acc, m) => acc + m.sumBlb, 0),
      sumPenambahanPiutang: monthlyPivot.reduce((acc, m) => acc + m.sumPenambahanPiutang, 0),
      sumPenguranganPiutang: monthlyPivot.reduce((acc, m) => acc + m.sumPenguranganPiutang, 0),
      totalKeluar: monthlyPivot.reduce((acc, m) => acc + m.totalKeluar, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        year,
        monthlyPivot,
        grandTotal,
      },
    });
  } catch (error) {
    console.error('GET /api/pemasaran/daily-outflow/pivot error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
