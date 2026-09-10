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
    const nomorBaStr = existing.nomorBA || existing.nomorBa || existing.nomor_ba || id;

    let updated = null;
    try {
      updated = await prisma.beritaAcara.update({
        where: { id },
        data: {
          status: 'DITERIMA',
          readAt: readAt,
          penerimaName: actorName,
          logs: {
            create: {
              action: 'CONFIRMED_PEMASARAN',
              actorName: actorName,
              actorRole: authUser.role || 'ADMIN_PEMASARAN',
              notes: `Berita Acara ${nomorBaStr} (${existing.diserahterimakan} ${existing.unit || 'Liter'}) telah resmi dikonfirmasi & diterima oleh Seksi Pemasaran (${actorName}).`,
            },
          },
        },
        include: {
          production: true,
          createdBy: { select: { id: true, name: true, email: true } },
          logs: { orderBy: { createdAt: 'asc' } },
        },
      });
    } catch (e) {
      updated = {
        ...existing,
        status: 'DITERIMA',
        readAt: readAt.toISOString(),
        penerimaName: actorName,
      };
    }

    // Sync linked MilkRequest if this is a milk request BAST
    const notesStr = existing.notes || '';
    const reqMatch = notesStr.match(/REQ-\d{8}-\d{3}/i);
    const isPermintaan = existing.type === 'PERMINTAAN_SUSU' || existing.type === 'REQUEST_SUSU' || nomorBaStr.startsWith('BAST-REQ-');

    if (reqMatch || isPermintaan) {
      try {
        let reqWhere = {};
        if (reqMatch) {
          reqWhere.requestNo = reqMatch[0];
        } else {
          reqWhere.status = 'MENUNGGU_PERSETUJUAN';
        }

        const linkedReq = await prisma.milkRequest.findFirst({
          where: reqWhere,
          orderBy: { createdAt: 'desc' }
        });

        if (linkedReq) {
          await prisma.milkRequest.update({
            where: { id: linkedReq.id },
            data: {
              status: 'DISETUJUI',
              approvedAt: readAt,
              approvedById: validUserId,
              approvedByName: actorName,
            }
          });

          if (global.__inMemoryMilkRequestList) {
            const idx = global.__inMemoryMilkRequestList.findIndex((r) => r.id === linkedReq.id || r.requestNo === linkedReq.requestNo);
            if (idx !== -1) {
              global.__inMemoryMilkRequestList[idx].status = 'DISETUJUI';
              global.__inMemoryMilkRequestList[idx].approvedAt = readAt.toISOString();
              global.__inMemoryMilkRequestList[idx].approvedByName = actorName;
            }
          }
        }
      } catch (reqSyncErr) {
        console.error('Error syncing linked MilkRequest on BAST confirm:', reqSyncErr);
      }

      // Notify Admin Pengemasan that their request has been approved
      try {
        if (prisma.notification && typeof prisma.notification.create === 'function') {
          await prisma.notification.create({
            data: {
              title: `Permintaan Susu Disetujui: ${existing.diserahterimakan} L`,
              message: `Dokumen ${nomorBaStr} telah dikonfirmasi dan disetujui oleh Seksi Pemasaran (${actorName}). Bahan baku susu siap diolah!`,
              type: 'REQUEST_SUSU',
              targetRole: 'ADMIN_PENGEMASAN',
              senderId: validUserId,
              senderName: actorName,
              senderRole: authUser.role || 'ADMIN_PEMASARAN',
              link: '/uht/dashboard',
            }
          });
        }
      } catch (notifErr) {
        console.error('Error notifying admin pengemasan on BAST confirm:', notifErr);
      }
    }

    // Also record system log
    try {
      await prisma.systemLog.create({
        data: {
          userId: validUserId,
          userEmail: authUser.email,
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
