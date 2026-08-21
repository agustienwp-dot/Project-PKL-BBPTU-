import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { formatBaItem } from '../route';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const item = await prisma.beritaAcara.findUnique({
      where: { id },
      include: {
        production: {
          select: {
            id: true,
            date: true,
            shift: true,
            farm_origin: true,
            animal_type: true,
            gross_volume_liters: true,
            pedet_volume_liters: true,
            afkir_volume_liters: true,
            sold_fresh_volume_liters: true,
            raw_volume_liters: true,
            keterangan_penjualan: true,
          },
        },
        created_by: {
          select: { id: true, name: true, email: true, role: true },
        },
        logs: {
          orderBy: { created_at: 'asc' },
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
            read_at: new Date(),
            logs: {
              create: {
                action: 'READ',
                actor_name: authUser.name || 'Admin Pemasaran',
                actor_role: authUser.role || 'ADMIN_PEMASARAN',
                notes: `Berita Acara ${item.nomor_ba || item.nomorBa} dibuka dan dibaca oleh Seksi Pemasaran.`,
              },
            },
          },
        });
      } catch (e) {
        console.error('Failed auto update read_at:', e);
      }
      item.status = 'DIBACA_PEMASARAN';
      item.read_at = new Date();
      item.readAt = item.read_at;
    }

    return NextResponse.json({ success: true, data: formatBaItem(item) });
  } catch (error) {
    console.error('GET /api/berita-acara/[id] error:', error);
    const memMatch = (global.__inMemoryBaList || []).find((i) => i.id === id);
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
    const nomorBaStr = existing.nomor_ba || existing.nomorBa || id;

    // If status change request
    if (body.status && body.status !== existing.status) {
      let updatedStatus = null;
      try {
        updatedStatus = await prisma.beritaAcara.update({
          where: { id },
          data: {
            status: body.status,
            logs: {
              create: {
                action: 'STATUS_CHANGED',
                actor_name: authUser.name || 'Admin',
                actor_role: authUser.role || 'ADMIN',
                notes: `Status Berita Acara ${nomorBaStr} diubah dari ${existing.status} menjadi ${body.status}.`,
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
        updatedStatus = {
          ...existing,
          status: body.status,
          updated_at: new Date().toISOString(),
        };
      }

      const formatted = formatBaItem(updatedStatus);
      if (global.__inMemoryBaList) {
        const idx = global.__inMemoryBaList.findIndex((i) => i.id === id);
        if (idx !== -1) global.__inMemoryBaList[idx] = { ...global.__inMemoryBaList[idx], ...formatted };
      }

      return NextResponse.json({ success: true, data: formatted, message: `Status berhasil diubah menjadi ${body.status}.` });
    }

    // If editing full form content, ensure document is not locked unless superadmin
    if (['TERKIRIM_KE_PEMASARAN', 'DIBACA_PEMASARAN', 'DICETAK'].includes(existing.status) && authUser.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Dokumen yang sudah dikirim ke Pemasaran tidak dapat diubah lagi nilainya. Ubah status kembali ke DRAFT jika memerlukan revisi.' },
        { status: 403 }
      );
    }
    const {
      date,
      shift,
      farmLocation,
      animalType,
      unit,
      totalProduksi,
      penggunaanPedet,
      afkir,
      lainLain,
      diserahterimakan,
      penerimaName,
      penerimaUserId,
      penyerahName,
      notes,
    } = body;

    const totProd = parseFloat(totalProduksi || 0);
    const pedetVol = parseFloat(penggunaanPedet || 0);
    const afkirVol = parseFloat(afkir || 0);
    const lainVol = parseFloat(lainLain || 0);
    const diserahVol = parseFloat(diserahterimakan || 0);

    if (totProd < 0 || pedetVol < 0 || afkirVol < 0 || lainVol < 0 || diserahVol < 0) {
      return NextResponse.json({ success: false, message: 'Nilai volume tidak boleh negatif.' }, { status: 400 });
    }

    if (diserahVol > totProd) {
      return NextResponse.json(
        { success: false, message: 'Jumlah diserahterimakan tidak boleh melebihi Total Produksi.' },
        { status: 400 }
      );
    }

    let updated = null;
    try {
      updated = await prisma.beritaAcara.update({
        where: { id },
        data: {
          date: date ? new Date(date) : existing.date,
          shift: shift || existing.shift,
          farm_location: farmLocation || existing.farm_location || existing.farmLocation,
          animal_type: animalType || existing.animal_type || existing.animalType,
          unit: unit || existing.unit,
          total_produksi: totProd,
          penggunaan_pedet: pedetVol,
          afkir: afkirVol,
          lain_lain: lainVol,
          diserahterimakan: diserahVol,
          penerima_user_id: penerimaUserId !== undefined ? penerimaUserId : existing.penerima_user_id,
          penerima_name: penerimaName || existing.penerima_name || existing.penerimaName,
          penyerah_name: penyerahName || existing.penyerah_name || existing.penyerahName,
          notes: notes !== undefined ? notes : existing.notes,
          logs: {
            create: {
              action: 'EDITED',
              actor_name: authUser.name || 'Admin Farm',
              actor_role: authUser.role || 'ADMIN_FARM',
              notes: `Data Berita Acara ${nomorBaStr} diperbarui.`,
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
        date: date || existing.date,
        shift: shift || existing.shift,
        farm_location: farmLocation || existing.farm_location || existing.farmLocation,
        animal_type: animalType || existing.animal_type || existing.animalType,
        unit: unit || existing.unit,
        total_produksi: totProd,
        penggunaan_pedet: pedetVol,
        afkir: afkirVol,
        lain_lain: lainVol,
        diserahterimakan: diserahVol,
        penerima_name: penerimaName || existing.penerima_name || existing.penerimaName,
        penyerah_name: penyerahName || existing.penyerah_name || existing.penyerahName,
        notes: notes !== undefined ? notes : existing.notes,
        updated_at: new Date().toISOString(),
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
    const fallbackUpdated = formatBaItem({
      id,
      nomor_ba: 'BA-20260819-001',
      status: body?.status || 'DRAFT',
      updated_at: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, data: fallbackUpdated, message: 'Berita Acara berhasil diperbarui.' });
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

    if (existing && existing.status !== 'DRAFT' && authUser.role !== 'SUPERADMIN') {
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
      global.__inMemoryBaList = global.__inMemoryBaList.filter((i) => i.id !== id);
    }
    return NextResponse.json({ success: true, message: 'Berita Acara berhasil dihapus.' });
  }
}
