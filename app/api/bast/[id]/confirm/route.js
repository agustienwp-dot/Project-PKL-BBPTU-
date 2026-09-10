import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PEMASARAN', 'ADMIN_FARM', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Hanya Admin Pemasaran, Admin Farm, atau Superadmin yang dapat mengonfirmasi serah terima BAST.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { catatan } = body;

    const bastClient = prisma.beritaAcara || prisma.bastDocument;
    if (!bastClient) {
      return NextResponse.json({ success: false, message: 'Database client tidak tersedia' }, { status: 500 });
    }

    const now = new Date();
    let doc = await bastClient.findUnique({ where: { id } }).catch(() => null);
    let linkedReq = null;

    if (!doc && prisma.milkRequest) {
      linkedReq = await prisma.milkRequest.findUnique({ where: { id } }).catch(() => null);
      if (linkedReq) {
        doc = await bastClient.findFirst({
          where: {
            OR: [
              { nomorBA: { contains: linkedReq.requestNo } },
              { notes: { contains: linkedReq.requestNo } },
            ]
          }
        }).catch(() => null);
      }
    }

    if (!doc && !linkedReq) {
      return NextResponse.json(
        { success: false, message: 'Surat BAST atau Request Susu tidak ditemukan.' },
        { status: 404 }
      );
    }

    const verifierName = (authUser.name || (authUser.role === 'ADMIN_FARM' ? 'Admin Farm Produksi' : 'Admin Pemasaran')).trim();
    const verifierRole = authUser.role || 'ADMIN_PEMASARAN';
    const validUserId = authUser.userId || authUser.id;

    let updatedDoc = doc;

    if (doc) {
      const penerimaNama = doc.penerimaName || doc.penerimaNama || verifierName;
      const penerimaRole = doc.penerimaRole || verifierRole;

      updatedDoc = await bastClient.update({
        where: { id: doc.id },
        data: {
          status: 'DITERIMA',
          penerimaName: penerimaNama,
          penerimaRole: penerimaRole,
          confirmedAt: now,
          confirmedByName: verifierName,
          confirmedBy: verifierRole,
          notes: catatan ? `${doc.notes || doc.catatan || ''}\n[Catatan Konfirmasi ${verifierName}]: ${catatan.trim()}` : (doc.notes || doc.catatan),
        },
      });

      // Find linked milk request from notes if not yet found
      if (!linkedReq && prisma.milkRequest) {
        const notesStr = doc.notes || doc.catatan || '';
        const reqMatch = notesStr.match(/REQ-\d{8}-\d{3}/i);
        if (reqMatch) {
          linkedReq = await prisma.milkRequest.findFirst({ where: { requestNo: reqMatch[0] } }).catch(() => null);
        } else if (doc.type === 'PERMINTAAN_SUSU' || doc.type === 'REQUEST_SUSU' || (doc.nomorBA && doc.nomorBA.startsWith('BAST-REQ-'))) {
          linkedReq = await prisma.milkRequest.findFirst({ where: { status: 'MENUNGGU_PERSETUJUAN' }, orderBy: { createdAt: 'desc' } }).catch(() => null);
        }
      }
    }

    if (linkedReq && prisma.milkRequest) {
      await prisma.milkRequest.update({
        where: { id: linkedReq.id },
        data: {
          status: 'DISETUJUI',
          approvedAt: now,
          approvedByName: verifierName,
          approvedById: validUserId,
        }
      }).catch((e) => console.error('Error updating MilkRequest in bast confirm:', e));

      if (global.__inMemoryMilkRequestList) {
        const idx = global.__inMemoryMilkRequestList.findIndex((r) => r.id === linkedReq.id || r.requestNo === linkedReq.requestNo);
        if (idx !== -1) {
          global.__inMemoryMilkRequestList[idx].status = 'DISETUJUI';
          global.__inMemoryMilkRequestList[idx].approvedAt = now.toISOString();
          global.__inMemoryMilkRequestList[idx].approvedByName = verifierName;
        }
      }
    }

    // Send notification to ADMIN_PENGEMASAN
    try {
      if (prisma.notification && typeof prisma.notification.create === 'function') {
        const vol = doc ? (doc.diserahterimakan || doc.totalProduksi || doc.volumeLiters) : (linkedReq?.volumeLiters || 0);
        const docNo = doc?.nomorBA || linkedReq?.requestNo || 'BAST Permintaan Susu';
        await prisma.notification.create({
          data: {
            title: `Permintaan Susu Disetujui: ${vol} L`,
            message: `Dokumen ${docNo} (${vol} Liter) telah disetujui & dikonfirmasi oleh Seksi Pemasaran (${verifierName}). Bahan baku susu siap diolah!`,
            type: 'REQUEST_SUSU',
            targetRole: 'ADMIN_PENGEMASAN',
            senderId: validUserId,
            senderName: verifierName,
            senderRole: verifierRole,
            link: '/uht/dashboard',
          }
        });
      }
    } catch (notifErr) {}

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengonfirmasi serah terima Berita Acara (BAST) Susu Segar!',
      data: updatedDoc || linkedReq,
    });
  } catch (error) {
    console.error('Error POST /api/bast/[id]/confirm:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengonfirmasi Surat BAST.' },
      { status: 500 }
    );
  }
}
