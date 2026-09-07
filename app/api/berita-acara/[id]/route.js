import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { formatBaItem } from '../route';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const item = await prisma.beritaAcara.findUnique({
      where: { id },
      include: {
        production: {
          select: {
            id: true,
            date: true,
            shift: true,
            farmOrigin: true,
            animalType: true,
            grossVolumeLiters: true,
            pedetVolumeLiters: true,
            afkirVolumeLiters: true,
            soldFreshVolumeLiters: true,
            rawVolumeLiters: true,
            keteranganPenjualan: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        logs: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!item) {
      const memMatch = (global.__inMemoryBaList || []).find((i) => i.id === id);
      if (memMatch) {
        return NextResponse.json({ success: true, data: formatBaItem(memMatch) });
      }
      return NextResponse.json({ success: false, message: 'Berita Acara tidak ditemukan.' }, { status: 404 });
    }

    // Auto mark as READ if accessed by ADMIN_PEMASARAN and status is TERKIRIM_KE_PEMASARAN
    if (authUser.role === 'ADMIN_PEMASARAN' && item.status === 'TERKIRIM_KE_PEMASARAN') {
      try {
        await prisma.beritaAcara.update({
          where: { id },
          data: {
            status: 'DIBACA_PEMASARAN',
            readAt: new Date(),
            logs: {
              create: {
                action: 'READ',
                actorName: authUser.name || 'Admin Pemasaran',
                actorRole: authUser.role || 'ADMIN_PEMASARAN',
                notes: `Berita Acara ${item.nomorBa || id} dibuka dan dibaca oleh Seksi Pemasaran.`,
              },
            },
          },
        });
      } catch (e) {
        console.error('Failed auto update readAt:', e);
      }
      item.status = 'DIBACA_PEMASARAN';
      item.readAt = new Date();
    }

    return NextResponse.json({ success: true, data: formatBaItem(item) });
  } catch (error) {
    console.error('GET /api/berita-acara/[id] error:', error);
    const memMatch = (global.__inMemoryBaList || []).find((i) => i.id === params.id);
    if (memMatch) {
      return NextResponse.json({ success: true, data: formatBaItem(memMatch) });
    }
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
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

    const body = await request.json();
    const nomorBaStr = existing.nomorBa || id;

    // Status update only
    if ((body.status && body.status !== existing.status) || body.action === 'CONFIRM_PEMASARAN') {
      const targetStatus = body.status || (body.action === 'CONFIRM_PEMASARAN' ? 'DITERIMA_PEMASARAN' : existing.status);
      const updateFields = {
        status: targetStatus,
        logs: {
          create: {
            action: targetStatus === 'DITERIMA_PEMASARAN' ? 'CONFIRMED' : 'STATUS_CHANGED',
            actorName: authUser.name || 'Admin',
            actorRole: authUser.role || 'ADMIN',
            notes: `Status Berita Acara ${nomorBaStr} diubah menjadi ${targetStatus}.`,
          },
        },
      };

      if (targetStatus === 'DITERIMA_PEMASARAN') {
        updateFields.confirmedBy = authUser.id;
        updateFields.confirmedByName = authUser.name || 'Admin Pemasaran';
        updateFields.confirmedAt = new Date();
      }

      let updatedStatus = null;
      try {
        updatedStatus = await prisma.beritaAcara.update({
          where: { id },
          data: updateFields,
          include: {
            production: true,
            createdBy: { select: { id: true, name: true, email: true } },
            logs: { orderBy: { createdAt: 'asc' } },
          },
        });
      } catch (e) {
        updatedStatus = {
          ...existing,
          ...updateFields,
          updatedAt: new Date().toISOString(),
        };
      }

      const formatted = formatBaItem(updatedStatus);
      if (global.__inMemoryBaList) {
        const idx = global.__inMemoryBaList.findIndex((i) => i.id === id);
        if (idx !== -1) global.__inMemoryBaList[idx] = { ...global.__inMemoryBaList[idx], ...formatted };
      }

      return NextResponse.json({ success: true, data: formatted, message: `Berita Acara berhasil dikonfirmasi.` });
    }

    // Editing document content
    const {
      type, date, period, location, farmLocation, animalType, unit, totalProduksi,
      penggunaanPedet, afkir, lainLain, diserahterimakan, penerimaName, penerimaUserId,
      penyerahName, giverName, giverTitle, giverDept, receiverName, receiverTitle,
      receiverDept, purpose, notes, items
    } = body;

    const totProd = parseFloat(totalProduksi || 0);
    const pedetVol = parseFloat(penggunaanPedet || 0);
    const afkirVol = parseFloat(afkir || 0);
    const lainVol = parseFloat(lainLain || 0);
    const diserahVol = parseFloat(diserahterimakan || 0);

    const itemsJson = typeof items === 'string' ? items : (items ? JSON.stringify(items) : existing.items);

    let updated = null;
    try {
      updated = await prisma.beritaAcara.update({
        where: { id },
        data: {
          type: type ? type.toUpperCase() : existing.type,
          date: date ? new Date(date) : existing.date,
          period: period !== undefined ? period : existing.period,
          location: location || farmLocation || existing.location,
          farmLocation: farmLocation || location || existing.farmLocation,
          animalType: animalType || existing.animalType,
          unit: unit || existing.unit,
          totalProduksi: totProd > 0 ? totProd : existing.totalProduksi,
          penggunaanPedet: pedetVol,
          afkir: afkirVol,
          lainLain: lainVol,
          diserahterimakan: diserahVol > 0 ? diserahVol : existing.diserahterimakan,
          penerimaUserId: penerimaUserId !== undefined ? penerimaUserId : existing.penerimaUserId,
          penerimaName: penerimaName || receiverName || existing.penerimaName,
          penyerahName: penyerahName || giverName || existing.penyerahName,
          giverName: giverName || penyerahName || existing.giverName,
          giverTitle: giverTitle !== undefined ? giverTitle : existing.giverTitle,
          giverDept: giverDept !== undefined ? giverDept : existing.giverDept,
          receiverName: receiverName || penerimaName || existing.receiverName,
          receiverTitle: receiverTitle !== undefined ? receiverTitle : existing.receiverTitle,
          receiverDept: receiverDept !== undefined ? receiverDept : existing.receiverDept,
          purpose: purpose !== undefined ? purpose : existing.purpose,
          notes: notes !== undefined ? notes : existing.notes,
          items: itemsJson,
          logs: {
            create: {
              action: 'EDITED',
              actorName: authUser.name || 'Admin',
              actorRole: authUser.role || 'ADMIN',
              notes: `Data Berita Acara ${nomorBaStr} diperbarui.`,
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
      console.error('prisma.beritaAcara.update error:', e);
      updated = {
        ...existing,
        type: type || existing.type,
        date: date || existing.date,
        location: location || farmLocation || existing.location,
        notes: notes !== undefined ? notes : existing.notes,
        updatedAt: new Date().toISOString(),
      };
    }

    const formatted = formatBaItem(updated);
    if (global.__inMemoryBaList) {
      const idx = global.__inMemoryBaList.findIndex((i) => i.id === id);
      if (idx !== -1) global.__inMemoryBaList[idx] = { ...global.__inMemoryBaList[idx], ...formatted };
    }

    return NextResponse.json({ success: true, data: formatted, message: 'Berita Acara berhasil diperbarui.' });
  } catch (error) {
    console.error('PUT /api/berita-acara/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui Berita Acara' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.beritaAcara.findUnique({ where: { id } }).catch(() => null);

    if (existing && existing.status !== 'DRAFT' && authUser.role !== 'SUPERADMIN' && authUser.role !== 'ADMIN_PENGEMASAN') {
      return NextResponse.json(
        { success: false, message: 'Hanya dokumen berstatus DRAFT yang dapat dihapus.' },
        { status: 403 }
      );
    }

    await prisma.beritaAcara.delete({ where: { id } }).catch(() => null);

    if (global.__inMemoryBaList) {
      global.__inMemoryBaList = global.__inMemoryBaList.filter((i) => i.id !== id);
    }

    return NextResponse.json({ success: true, message: 'Berita Acara berhasil dihapus.' });
  } catch (error) {
    console.error('DELETE /api/berita-acara/[id] error:', error);
    if (global.__inMemoryBaList) {
      global.__inMemoryBaList = global.__inMemoryBaList.filter((i) => i.id !== params.id);
    }
    return NextResponse.json({ success: true, message: 'Berita Acara berhasil dihapus.' });
  }
}
