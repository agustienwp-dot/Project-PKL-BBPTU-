import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { action, receivedVolumeLiters, notes } = body;

    let production = await prisma.milkProduction.findUnique({ where: { id } }).catch(() => null);
    let isMemory = false;

    if (!production && global.__inMemoryProductionList) {
      production = global.__inMemoryProductionList.find((p) => p.id === id);
      if (production) isMemory = true;
    }

    if (!production) {
      return NextResponse.json({ success: false, message: 'Data produksi perah tidak ditemukan' }, { status: 404 });
    }

    let updatedHandoverStatus = 'DITERIMA';
    let finalReceivedVolume = production.rawVolumeLiters || 0;

    if (action === 'DISCREPANCY') {
      const recVal = parseFloat(receivedVolumeLiters);
      if (isNaN(recVal) || recVal < 0) {
        return NextResponse.json({ success: false, message: 'Jumlah volume diterima tidak valid' }, { status: 400 });
      }
      updatedHandoverStatus = 'ADA_SELISIH';
      finalReceivedVolume = recVal;
    } else {
      // Default 1-click ACCEPT
      updatedHandoverStatus = 'DITERIMA';
      finalReceivedVolume = production.rawVolumeLiters || 0;
    }

    let updated = null;
    const updatedNotes = notes ? `${production.notes ? production.notes + ' | ' : ''}Catatan Verifikasi: ${notes}` : production.notes;

    if (!isMemory) {
      try {
        updated = await prisma.milkProduction.update({
          where: { id },
          data: {
            handoverStatus: updatedHandoverStatus,
            receivedVolumeLiters: finalReceivedVolume,
            notes: updatedNotes,
          },
        });
      } catch (e) {
        console.error('Error updating DB milkProduction:', e);
      }
    }

    if (isMemory || !updated) {
      if (global.__inMemoryProductionList) {
        const idx = global.__inMemoryProductionList.findIndex((p) => p.id === id);
        if (idx !== -1) {
          global.__inMemoryProductionList[idx] = {
            ...global.__inMemoryProductionList[idx],
            handoverStatus: updatedHandoverStatus,
            handover_status: updatedHandoverStatus,
            receivedVolumeLiters: finalReceivedVolume,
            notes: updatedNotes,
          };
          updated = global.__inMemoryProductionList[idx];
        }
      }
    }

    // Auto-create MilkReception record so raw milk stock reflects verified input
    if (finalReceivedVolume > 0) {
      try {
        await prisma.milkReception.create({
          data: {
            volumeLiters: finalReceivedVolume,
            date: production.date || new Date(),
            notes: `[Penerimaan Farm: ${production.farmOrigin || 'Manggala'}] ${production.animalType || 'SAPI'} - Status: ${updatedHandoverStatus} (${notes || 'Verifikasi Langsung'})`,
          },
        });
      } catch (e) {
        console.error('Error creating MilkReception on verify:', e);
      }
    }

    try {
      await prisma.systemLog.create({
        data: {
          userId: authUser.id,
          userEmail: authUser.email,
          action: 'VERIFY_MILK_HANDOVER',
          details: `Verifikasi penerimaan susu perah ID ${id}: ${updatedHandoverStatus} (${finalReceivedVolume} L)`,
        },
      });
    } catch (e) {
      console.error('Error creating SystemLog:', e);
    }

    return NextResponse.json({
      success: true,
      message: updatedHandoverStatus === 'DITERIMA'
        ? `Susu sebanyak ${finalReceivedVolume} Liter berhasil diterima & ditambahkan ke stok olah!`
        : `Laporan selisih volume (Dikirim: ${production.rawVolumeLiters}L, Diterima: ${finalReceivedVolume}L) telah dicatat.`,
      data: updated || { id, handoverStatus: updatedHandoverStatus, receivedVolumeLiters: finalReceivedVolume },
    });
  } catch (error) {
    console.error('PUT /api/farm/production/[id]/verify error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
