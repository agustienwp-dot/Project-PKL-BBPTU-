import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, resolveValidUserId } from '@/lib/auth';

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

    const readAt = new Date();
    const actorName = authUser.name || 'Admin Pemasaran';
    const validUserId = await resolveValidUserId(authUser);

    const updated = await prisma.beritaAcara.update({
      where: { id },
      data: {
        status: 'DIBACA_PEMASARAN',
        readAt,
        penerimaName: actorName,
        logs: {
          create: {
            action: 'CONFIRMED_PEMASARAN',
            actorName,
            actorRole: authUser.role || 'ADMIN_PEMASARAN',
            notes: `Berita Acara ${existing.nomorBa} (${existing.diserahterimakan} ${existing.unit}) telah resmi dikonfirmasi & diterima oleh Seksi Pemasaran (${actorName}).`,
          },
        },
      },
      include: {
        production: true,
        createdBy: { select: { id: true, name: true, email: true } },
        logs: { orderBy: { createdAt: 'asc' } },
      },
    });

    // Also record system log
    await prisma.systemLog.create({
      data: {
        userId: validUserId,
        userEmail: authUser.email,
        action: 'CONFIRM_BERITA_ACARA',
        details: `Seksi Pemasaran (${actorName}) mengkonfirmasi penerimaan Berita Acara ${existing.nomorBa} sejumlah ${existing.diserahterimakan} ${existing.unit}.`,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `✓ Berita Acara ${existing.nomorBa} (${existing.diserahterimakan} ${existing.unit}) berhasil dikonfirmasi oleh Seksi Pemasaran!`,
    });
  } catch (error) {
    console.error('POST /api/berita-acara/[id]/confirm error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
