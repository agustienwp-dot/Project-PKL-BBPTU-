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

    const production = await prisma.milkProduction.findUnique({ where: { id } });
    if (!production) {
      return NextResponse.json({ success: false, message: 'Data produksi perah tidak ditemukan' }, { status: 404 });
    }

    let updatedHandoverStatus = 'DITERIMA';
    let finalReceivedVolume = production.rawVolumeLiters;

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
      finalReceivedVolume = production.rawVolumeLiters;
    }

    const updated = await prisma.milkProduction.update({
      where: { id },
      data: {
        handover_status: updatedHandoverStatus,
        receivedVolumeLiters: finalReceivedVolume,
        notes: notes ? `${production.notes ? production.notes + ' | ' : ''}Catatan Verifikasi: ${notes}` : production.notes,
      },
    });

    // Auto-create MilkReception record so raw milk stock reflects verified input
    if (finalReceivedVolume > 0) {
      try {
        await prisma.milkReception.create({
          data: {
            volumeLiters: finalReceivedVolume,
            date: production.date || new Date(),
            notes: `[Penerimaan Farm: ${production.farmOrigin}] ${production.animalType} - Status: ${updatedHandoverStatus} (${notes || 'Verifikasi Langsung'})`,
          },
        });
      } catch (e) {
        console.error('Error creating MilkReception on verify:', e);
      }
    }

    await prisma.systemLog.create({
      data: {
        userId: authUser.id,
        userEmail: authUser.email,
        action: 'VERIFY_MILK_HANDOVER',
        details: `Verifikasi penerimaan susu perah ID ${id}: ${updatedHandoverStatus} (${finalReceivedVolume} L)`,
      },
    });

    return NextResponse.json({
      success: true,
      message: updatedHandoverStatus === 'DITERIMA'
        ? `Susu sebanyak ${finalReceivedVolume} Liter berhasil diterima & ditambahkan ke stok olah!`
        : `Laporan selisih volume (Dikirim: ${production.rawVolumeLiters}L, Diterima: ${finalReceivedVolume}L) telah dicatat.`,
      data: updated,
    });
  } catch (error) {
    console.error('PUT /api/farm/production/[id]/verify error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
