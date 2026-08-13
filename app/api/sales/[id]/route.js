import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        animal: {
          include: {
            cage: true,
          },
        },
        buyer: true,
      },
    });

    if (!sale) {
      return NextResponse.json({ success: false, message: 'Transaksi penjualan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: sale });
  } catch (error) {
    console.error('GET /api/sales/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
