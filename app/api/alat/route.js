import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const equipments = await prisma.equipment.findMany({
      orderBy: { name: 'asc' },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    const allTransactions = await prisma.equipmentTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        equipment: { select: { name: true, unit: true, category: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        equipments,
        recentTransactions: allTransactions,
      },
    });
  } catch (error) {
    console.error('GET /api/alat error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { actionType } = await request.json(); // 'CREATE_EQUIPMENT' | 'RECORD_TRANSACTION'

    if (actionType === 'CREATE_EQUIPMENT') {
      const { name, category, initialStock, unit } = await request.json();
      if (!name) {
        return NextResponse.json({ success: false, message: 'Nama alat wajib diisi' }, { status: 400 });
      }

      const existing = await prisma.equipment.findUnique({ where: { name } });
      if (existing) {
        return NextResponse.json({ success: false, message: 'Nama alat sudah ada' }, { status: 400 });
      }

      const initQty = parseInt(initialStock || '0', 10);

      const newEq = await prisma.equipment.create({
        data: {
          name,
          category: category || 'Kemasan',
          currentStock: initQty,
          unit: unit || 'pcs',
        },
      });

      if (initQty > 0) {
        await prisma.equipmentTransaction.create({
          data: {
            equipmentId: newEq.id,
            type: 'PEMBELIAN',
            quantity: initQty,
            destinationOrSupplier: 'Stok Awal Inventoris',
            notes: 'Pencatatan stok awal saat mendaftarkan alat',
          },
        });
      }

      return NextResponse.json({ success: true, message: 'Alat baru berhasil ditambahkan', data: newEq }, { status: 201 });
    }

    // RECORD_TRANSACTION (PEMBELIAN / DISTRIBUSI)
    const { equipmentId, type, quantity, destinationOrSupplier, notes, date } = await request.json();

    if (!equipmentId || !type || !quantity || parseInt(quantity, 10) <= 0) {
      return NextResponse.json({ success: false, message: 'Alat, Tipe Transaksi, dan Jumlah positif wajib diisi' }, { status: 400 });
    }

    const qty = parseInt(quantity, 10);
    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) {
      return NextResponse.json({ success: false, message: 'Alat tidak ditemukan' }, { status: 404 });
    }

    if (type === 'DISTRIBUSI' && qty > equipment.currentStock) {
      return NextResponse.json({
        success: false,
        message: `Stok alat "${equipment.name}" tidak mencukupi! Stok tersedia: ${equipment.currentStock} ${equipment.unit}, diminta: ${qty} ${equipment.unit}.`,
      }, { status: 400 });
    }

    const newStock = type === 'PEMBELIAN' ? equipment.currentStock + qty : equipment.currentStock - qty;

    const [updatedEq, newTx] = await prisma.$transaction([
      prisma.equipment.update({
        where: { id: equipmentId },
        data: { currentStock: Math.max(0, newStock) },
      }),
      prisma.equipmentTransaction.create({
        data: {
          equipmentId,
          type,
          quantity: qty,
          destinationOrSupplier: destinationOrSupplier || null,
          notes: notes || null,
          date: date ? new Date(date) : new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Transaksi ${type} alat "${equipment.name}" berhasil dicatat! Sisa stok: ${updatedEq.currentStock} ${equipment.unit}`,
      data: { equipment: updatedEq, transaction: newTx },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/alat error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
