import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, resolveValidUserId } from '@/lib/auth';
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

    const readAt = new Date();
    const actorName = authUser.name || 'Admin Pemasaran';
    const validUserId = await resolveValidUserId(authUser);
    const nomorBaStr = existing.nomor_ba || existing.nomorBa || id;

    let updated = null;
    try {
      updated = await prisma.beritaAcara.update({
        where: { id },
        data: {
          status: 'DIBACA_PEMASARAN',
          read_at: readAt,
          penerima_name: actorName,
          logs: {
            create: {
              action: 'CONFIRMED_PEMASARAN',
              actor_name: actorName,
              actor_role: authUser.role || 'ADMIN_PEMASARAN',
              notes: `Berita Acara ${nomorBaStr} (${existing.diserahterimakan} ${existing.unit || 'Liter'}) telah resmi dikonfirmasi & diterima oleh Seksi Pemasaran (${actorName}).`,
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
        status: 'DIBACA_PEMASARAN',
        read_at: readAt.toISOString(),
        penerima_name: actorName,
      };
    }

    // Also record system log
    try {
      await prisma.systemLog.create({
        data: {
          user_id: validUserId,
          user_email: authUser.email,
          action: 'CONFIRM_BERITA_ACARA',
          details: `Seksi Pemasaran (${actorName}) mengkonfirmasi penerimaan Berita Acara ${nomorBaStr} sejumlah ${existing.diserahterimakan} ${existing.unit || 'Liter'}.`,
        },
      });
    } catch (e) {}

    const formatted = formatBaItem(updated);

    if (global.__inMemoryBaList) {
      const idx = global.__inMemoryBaList.findIndex((i) => i.id === id);
      if (idx !== -1) global.__inMemoryBaList[idx] = { ...global.__inMemoryBaList[idx], ...formatted };
    }

    return NextResponse.json({
      success: true,
      data: formatted,
      message: `✓ Berita Acara ${nomorBaStr} (${existing.diserahterimakan} ${existing.unit || 'Liter'}) berhasil dikonfirmasi oleh Seksi Pemasaran!`,
    });
  } catch (error) {
    console.error('POST /api/berita-acara/[id]/confirm error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
