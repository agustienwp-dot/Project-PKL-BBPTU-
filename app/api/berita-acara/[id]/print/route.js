import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.beritaAcara.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Berita Acara tidak ditemukan.' }, { status: 404 });
    }

    const printedAt = new Date();

    const updated = await prisma.beritaAcara.update({
      where: { id },
      data: {
        status: 'DICETAK',
        printedAt,
        logs: {
          create: {
            action: 'PRINTED',
            actorName: authUser.name || 'User',
            actorRole: authUser.role || 'USER',
            notes: `Berita Acara ${existing.nomorBa} dicetak / didownload oleh ${authUser.name}.`,
          },
        },
      },
      include: {
        production: true,
        createdBy: { select: { id: true, name: true, email: true } },
        logs: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Status Berita Acara ${existing.nomorBa} diperbarui menjadi DICETAK.`,
    });
  } catch (error) {
    console.error('POST /api/berita-acara/[id]/print error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
