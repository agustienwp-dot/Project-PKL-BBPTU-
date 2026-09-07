import { NextResponse } from 'next/server';
import prisma, { isDbOffline } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (isDbOffline()) {
      throw new Error('DB_OFFLINE');
    }

    const body = await request.json();
    const { materialId, adjustmentType, quantity, reason, notes } = body;

    if (!materialId) {
      return NextResponse.json({ success: false, message: 'Bahan kemasan harus dipilih' }, { status: 400 });
    }

    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      return NextResponse.json({ success: false, message: 'Jumlah penyesuaian harus berupa angka positif' }, { status: 400 });
    }

    if (!['Penambahan', 'Pengurangan'].includes(adjustmentType)) {
      return NextResponse.json({ success: false, message: 'Jenis penyesuaian harus Penambahan atau Pengurangan' }, { status: 400 });
    }

    const material = await prisma.packagingMaterial.findUnique({
      where: { id: materialId }
    });

    if (!material) {
      return NextResponse.json({ success: false, message: 'Data bahan kemasan tidak ditemukan' }, { status: 404 });
    }

    const previousStock = material.currentStock || 0;
    let newStock = previousStock;

    if (adjustmentType === 'Penambahan') {
      newStock = previousStock + numQty;
    } else {
      if (previousStock < numQty) {
        return NextResponse.json({
          success: false,
          message: `Stok fisik tidak mencukupi untuk pengurangan. Stok saat ini: ${previousStock} ${material.unit || 'pcs'}`
        }, { status: 400 });
      }
      newStock = previousStock - numQty;
    }

    // Update material current stock
    const updatedMaterial = await prisma.packagingMaterial.update({
      where: { id: materialId },
      data: { currentStock: newStock }
    });

    // Record movement audit log
    const movement = await prisma.materialStockMovement.create({
      data: {
        materialId,
        type: adjustmentType === 'Penambahan' ? 'ADDITION' : 'DEDUCTION',
        quantity: numQty,
        previousStock,
        newStock,
        source: 'PENYESUAIAN',
        notes: `[${reason || 'Penyesuaian Stok'}] ${notes || ''}`.trim(),
        createdById: authUser.id
      }
    });

    return NextResponse.json({
      success: true,
      message: `Stok ${material.name} berhasil diperbarui menjadi ${newStock} ${material.unit || 'pcs'}`,
      data: {
        material: updatedMaterial,
        movement
      }
    });
  } catch (error) {
    console.error('Error in material stock adjustment:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
