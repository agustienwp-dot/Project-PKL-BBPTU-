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
    const { materialId, quantity, notes, items: rawItems } = body;
    const adjustmentType = body.adjustmentType || 'Penambahan';
    const reason = body.reason || 'Stok fisik baru datang';

    if (!['Penambahan', 'Pengurangan'].includes(adjustmentType)) {
      return NextResponse.json({ success: false, message: 'Jenis penyesuaian harus Penambahan atau Pengurangan' }, { status: 400 });
    }

    // Normalize items array
    let itemsToProcess = [];
    if (Array.isArray(rawItems) && rawItems.length > 0) {
      itemsToProcess = rawItems;
    } else if (materialId) {
      itemsToProcess = [{ materialId, quantity }];
    } else {
      return NextResponse.json({ success: false, message: 'Silakan tentukan minimal 1 bahan kemasan' }, { status: 400 });
    }

    // Validate items
    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      if (!item.materialId) {
        return NextResponse.json({ success: false, message: `Bahan kemasan pada baris ke-${i + 1} harus dipilih` }, { status: 400 });
      }
      const numQty = parseFloat(item.quantity);
      if (isNaN(numQty) || numQty <= 0) {
        return NextResponse.json({ success: false, message: `Jumlah penyesuaian pada baris ke-${i + 1} harus angka > 0` }, { status: 400 });
      }
    }

    // Process adjustments
    const results = [];
    for (const item of itemsToProcess) {
      const numQty = parseFloat(item.quantity);
      const material = await prisma.packagingMaterial.findUnique({
        where: { id: item.materialId }
      });

      if (!material) {
        return NextResponse.json({ success: false, message: `Data bahan kemasan tidak ditemukan` }, { status: 404 });
      }

      const previousStock = material.currentStock || 0;
      let newStock = previousStock;

      if (adjustmentType === 'Penambahan') {
        newStock = previousStock + numQty;
      } else {
        if (previousStock < numQty) {
          return NextResponse.json({
            success: false,
            message: `Stok fisik ${material.name} tidak mencukupi untuk pengurangan. Stok saat ini: ${previousStock} ${material.unit || 'pcs'}`
          }, { status: 400 });
        }
        newStock = previousStock - numQty;
      }

      // Update material stock
      const updatedMaterial = await prisma.packagingMaterial.update({
        where: { id: item.materialId },
        data: { currentStock: newStock }
      });

      // Record movement log
      const movement = await prisma.materialStockMovement.create({
        data: {
          materialId: item.materialId,
          type: adjustmentType === 'Penambahan' ? 'ADDITION' : 'DEDUCTION',
          quantity: numQty,
          previousStock,
          newStock,
          source: 'PENYESUAIAN',
          notes: `[${reason || 'Penyesuaian Stok'}] ${notes || ''}`.trim(),
          createdById: authUser.id
        }
      });

      results.push({ material: updatedMaterial, movement });
    }

    const message = results.length > 1
      ? `Penyesuaian stok berhasil disimpan untuk ${results.length} bahan kemasan!`
      : `Stok ${results[0]?.material?.name} berhasil diperbarui menjadi ${results[0]?.material?.currentStock} ${results[0]?.material?.unit || 'pcs'}`;

    return NextResponse.json({
      success: true,
      message,
      data: results
    });
  } catch (error) {
    console.error('Error in material stock adjustment:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

