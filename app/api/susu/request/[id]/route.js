import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, resolveValidUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let record = null;
    try {
      record = await prisma.milkRequest.findUnique({
        where: { id },
        include: { createdBy: { select: { id: true, name: true, email: true, role: true } } }
      });
    } catch (e) {
      record = null;
    }

    if (!record && global.__inMemoryMilkRequestList) {
      record = global.__inMemoryMilkRequestList.find((i) => i.id === id || i.requestNo === id);
    }

    if (!record) {
      return NextResponse.json({ success: false, message: 'Request susu tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('GET /api/susu/request/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, rejectionReason, receivedVolumeLiters, notes } = body;

    let existing = null;
    try {
      existing = await prisma.milkRequest.findUnique({ where: { id } });
    } catch (e) {
      existing = null;
    }
    if (!existing && global.__inMemoryMilkRequestList) {
      existing = global.__inMemoryMilkRequestList.find((i) => i.id === id || i.requestNo === id);
    }

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Request susu tidak ditemukan' }, { status: 404 });
    }

    const validUserId = await resolveValidUserId(authUser);
    const now = new Date();
    let updateData = { updatedAt: now };
    let message = 'Status request berhasil diperbarui.';

    if (action === 'APPROVE') {
      if (authUser.role !== 'ADMIN_PEMASARAN' && authUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Pemasaran yang dapat menyetujui request susu' }, { status: 403 });
      }
      updateData.status = 'DISETUJUI';
      updateData.approvedAt = now;
      updateData.approvedById = validUserId;
      updateData.approvedByName = authUser.name || 'Admin Pemasaran';
      message = `Request susu ${existing.requestNo} disetujui.`;
    } else if (action === 'REJECT') {
      if (authUser.role !== 'ADMIN_PEMASARAN' && authUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Pemasaran yang dapat menolak request susu' }, { status: 403 });
      }
      if (!rejectionReason || !rejectionReason.trim()) {
        return NextResponse.json({ success: false, message: 'Alasan penolakan wajib diisi' }, { status: 400 });
      }
      updateData.status = 'DITOLAK';
      updateData.rejectionReason = rejectionReason.trim();
      message = `Request susu ${existing.requestNo} ditolak.`;
    } else if (action === 'DISPATCH' || action === 'PREPARE') {
      if (authUser.role !== 'ADMIN_PEMASARAN' && authUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Pemasaran yang dapat memproses/menyerahkan susu' }, { status: 403 });
      }
      updateData.status = 'SIAP_DITERIMA';
      updateData.readyForReceiptAt = now;
      updateData.dispatchedAt = now;
      message = `Susu bahan baku siap diserahkan kepada Admin Pengemasan.`;
    } else if (action === 'CONFIRM_RECEIPT') {
      if (authUser.role !== 'ADMIN_PENGEMASAN' && authUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Pengemasan yang dapat mengonfirmasi penerimaan susu' }, { status: 403 });
      }
      const recVol = parseFloat(receivedVolumeLiters !== undefined ? receivedVolumeLiters : existing.volumeLiters);
      updateData.status = 'DITERIMA';
      updateData.receivedVolumeLiters = recVol;
      updateData.receivedAt = now;
      updateData.receivedById = validUserId;
      updateData.receivedByName = authUser.name || 'Admin Pengemasan';
      message = `Penerimaan susu (${recVol} Liter) berhasil dikonfirmasi oleh Admin Pengemasan.`;
    } else if (body.status) {
      updateData.status = body.status;
    }

    let updatedRecord = null;
    try {
      updatedRecord = await prisma.milkRequest.update({
        where: { id: existing.id },
        data: updateData,
        include: { createdBy: { select: { id: true, name: true, email: true, role: true } } }
      });
    } catch (e) {
      console.error('prisma.milkRequest.update error:', e);
      updatedRecord = {
        ...existing,
        ...updateData,
        updatedAt: now.toISOString()
      };
    }

    if (global.__inMemoryMilkRequestList) {
      const idx = global.__inMemoryMilkRequestList.findIndex((i) => i.id === existing.id || i.requestNo === existing.requestNo);
      if (idx !== -1) {
        global.__inMemoryMilkRequestList[idx] = {
          ...global.__inMemoryMilkRequestList[idx],
          ...updatedRecord
        };
      }
    }

    return NextResponse.json({
      success: true,
      message,
      data: updatedRecord
    });
  } catch (error) {
    console.error('PUT /api/susu/request/[id] error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
