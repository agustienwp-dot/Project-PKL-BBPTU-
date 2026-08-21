import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { formatBaItem } from '../../route';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    let existing = null;
    try {
      existing = await prisma.beritaAcara.findUnique({ where: { id } });
    } catch (e) {
      existing = null;
    }

    if (!existing && global.__inMemoryBaList) {
      existing = global.__inMemoryBaList.find((i) => i.id === id);
    }

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Berita Acara tidak ditemukan.' }, { status: 404 });
    }

    const printedAt = new Date();
    const nomorBaStr = existing.nomor_ba || existing.nomorBa || id;

    let updated = null;
    try {
      updated = await prisma.beritaAcara.update({
        where: { id },
        data: {
          status: 'DICETAK',
          printed_at: printedAt,
          logs: {
            create: {
              action: 'PRINTED',
              actor_name: authUser.name || 'User',
              actor_role: authUser.role || 'USER',
              notes: `Berita Acara ${nomorBaStr} dicetak / didownload oleh ${authUser.name}.`,
            },
          },
        },
        include: {
          production: true,
          created_by: { select: { id: true, name: true, email: true } },
          logs: { orderBy: { created_at: 'asc' } },
        },
      });
    } catch (e) {
      updated = {
        ...existing,
        status: 'DICETAK',
        printed_at: printedAt.toISOString(),
      };
    }

    const formatted = formatBaItem(updated);

    if (global.__inMemoryBaList) {
      const idx = global.__inMemoryBaList.findIndex((i) => i.id === id);
      if (idx !== -1) global.__inMemoryBaList[idx] = { ...global.__inMemoryBaList[idx], ...formatted };
    }

    return NextResponse.json({
      success: true,
      data: formatted,
      message: `Status Berita Acara ${nomorBaStr} diperbarui menjadi DICETAK.`,
    });
  } catch (error) {
    console.error('POST /api/berita-acara/[id]/print error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
