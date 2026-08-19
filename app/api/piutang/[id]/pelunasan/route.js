import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PEMASARAN', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Peran tidak diizinkan.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { jumlah, tanggal, catatan } = body;

    const numJumlah = parseFloat(jumlah);
    if (isNaN(numJumlah) || numJumlah <= 0) {
      return NextResponse.json(
        { success: false, message: 'Jumlah pelunasan harus lebih besar dari 0.' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const piutangItem = await tx.piutang.findUnique({
        where: { id },
      });

      if (!piutangItem) {
        throw new Error('Data piutang tidak ditemukan.');
      }

      if (piutangItem.lunas || piutangItem.sisaPiutang <= 0) {
        throw new Error('Piutang ini sudah lunas.');
      }

      if (numJumlah > piutangItem.sisaPiutang + 0.01) {
        throw new Error(`Jumlah pembayaran (Rp ${numJumlah.toLocaleString()}) melebihi sisa piutang (Rp ${piutangItem.sisaPiutang.toLocaleString()}).`);
      }

      const newSisa = Math.max(0, piutangItem.sisaPiutang - numJumlah);
      const isLunas = newSisa <= 0;

      // Update Piutang record
      const updatedPiutang = await tx.piutang.update({
        where: { id },
        data: {
          sisaPiutang: newSisa,
          lunas: isLunas,
        },
      });

      // Create PelunasanPiutang record
      const pelunasanDate = tanggal ? new Date(tanggal) : new Date();
      const newPelunasan = await tx.pelunasanPiutang.create({
        data: {
          piutangId: id,
          jumlah: numJumlah,
          tanggal: pelunasanDate,
          catatan: catatan ? catatan.trim() : null,
        },
      });

      return { updatedPiutang, newPelunasan };
    });

    return NextResponse.json({
      success: true,
      message: 'Berhasil mencatat pelunasan piutang.',
      data: result,
    });
  } catch (error) {
    console.error('Error POST /api/piutang/[id]/pelunasan:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mencatat pelunasan piutang.' },
      { status: 400 }
    );
  }
}
