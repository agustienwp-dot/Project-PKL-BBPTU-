import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, resolveValidUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { action } = body;

    const existing = await prisma.milkPackaging.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data pengemasan tidak ditemukan' }, { status: 404 });
    }

    const validUserId = await resolveValidUserId(authUser);

    // ACTION: SEND TO PEMASARAN
    if (action === 'SEND') {
      if (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'ADMIN_PENGEMASAN' && authUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Farm/Pengemasan yang dapat mengirim ke Pemasaran' }, { status: 403 });
      }

      if (existing.status === 'DITERIMA') {
        return NextResponse.json({ success: false, message: 'Data ini sudah diterima oleh Pemasaran dan tidak dapat dikirim ulang' }, { status: 400 });
      }

      const updated = await prisma.milkPackaging.update({
        where: { id },
        data: {
          status: 'MENUNGGU_PENERIMAAN',
          sentAt: new Date(),
          sentById: validUserId,
          sentByName: authUser.name || authUser.email,
          quantitySent: existing.totalPackagedQty,
        },
        include: {
          category: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });

      try {
        await prisma.systemLog.create({
          data: {
            userId: validUserId,
            userEmail: authUser.email || '',
            action: 'SEND_PACKAGING',
            details: `Mengirim pengemasan ID ${id} (${existing.totalPackagedQty} pcs) ke Admin Pemasaran`,
          },
        });
      } catch (logErr) {}

      return NextResponse.json({
        success: true,
        message: 'Produk berhasil dikirim ke Admin Pemasaran!',
        data: updated,
      });
    }

    // ACTION: RECEIVE PRODUCT (BY PEMASARAN)
    if (action === 'RECEIVE') {
      if (authUser.role !== 'ADMIN_PEMASARAN' && authUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Pemasaran yang dapat mengonfirmasi penerimaan' }, { status: 403 });
      }

      if (existing.status === 'DITERIMA') {
        return NextResponse.json({ success: false, message: 'Produk ini sudah dikonfirmasi diterima sebelumnya' }, { status: 400 });
      }

      const { quantityReceived, condition, receptionNotes } = body;
      const qRec = quantityReceived !== undefined ? parseInt(quantityReceived, 10) || 0 : existing.totalPackagedQty;

      if (qRec < 0) {
        return NextResponse.json({ success: false, message: 'Jumlah diterima tidak boleh bernilai negatif' }, { status: 400 });
      }

      const updated = await prisma.milkPackaging.update({
        where: { id },
        data: {
          status: 'DITERIMA',
          receivedAt: new Date(),
          receivedById: validUserId,
          receivedByName: authUser.name || authUser.email,
          quantityReceived: qRec,
          condition: condition || 'Sesuai',
          receptionNotes: receptionNotes || '',
        },
        include: {
          category: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });

      try {
        await prisma.systemLog.create({
          data: {
            userId: validUserId,
            userEmail: authUser.email || '',
            action: 'RECEIVE_PACKAGING',
            details: `Admin Pemasaran mengonfirmasi penerimaan ID ${id}: Diterima ${qRec} pcs (Kondisi: ${condition || 'Sesuai'})`,
          },
        });
      } catch (logErr) {}

      return NextResponse.json({
        success: true,
        message: `Produk berhasil diterima (${qRec} pcs) & stok pemasaran otomatis bertambah!`,
        data: updated,
      });
    }

    // ACTION: REQUEST CORRECTION (BY PEMASARAN)
    if (action === 'REQUEST_CORRECTION') {
      if (authUser.role !== 'ADMIN_PEMASARAN' && authUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Pemasaran yang dapat meminta koreksi' }, { status: 403 });
      }

      const { receptionNotes } = body;

      const updated = await prisma.milkPackaging.update({
        where: { id },
        data: {
          status: 'PERLU_KOREKSI',
          receptionNotes: receptionNotes || 'Permintaan koreksi data pengemasan dari Admin Pemasaran',
        },
        include: {
          category: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });

      try {
        await prisma.systemLog.create({
          data: {
            userId: validUserId,
            userEmail: authUser.email || '',
            action: 'REJECT_PACKAGING',
            details: `Admin Pemasaran meminta koreksi data pengemasan ID ${id}: ${receptionNotes || '-'}`,
          },
        });
      } catch (logErr) {}

      return NextResponse.json({
        success: true,
        message: 'Permintaan koreksi berhasil dikirim ke Admin Pengemasan/Farm!',
        data: updated,
      });
    }

    // DEFAULT ACTION: FULL UPDATE PACKAGING ITEM
    if (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'ADMIN_PENGEMASAN' && authUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    const {
      date, productionId, productCategory, productSubtype, origin, variant, animalType,
      categoryId, processedAmount, processedUnit, packagingItems, notes
    } = body;

    if (date) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const inputDateStr = typeof date === 'string' ? date.split('T')[0] : '';
      if (inputDateStr && inputDateStr > todayStr) {
        return NextResponse.json({ success: false, message: 'Tanggal pengemasan tidak boleh lebih dari tanggal sekarang' }, { status: 400 });
      }
    }

    const targetProductionId = (productionId === 'SUSU_SEGAR' || productionId === 'SUSU_OLAHAN') ? null : (productionId || existing.productionId || null);

    const pCategory = productCategory || existing.productCategory || 'Susu';
    const pSubtype = productSubtype || existing.productSubtype;
    const pOrigin = origin || existing.origin || 'Sapi';
    const pVariant = pOrigin === 'Sapi' ? (variant || existing.variant || 'Original') : null;
    const aType = animalType || (pOrigin === 'Kambing' ? 'KAMBING' : 'SAPI');
    const pAmount = processedAmount !== undefined ? parseFloat(processedAmount) || 0 : existing.processedAmount;
    const pUnit = processedUnit || existing.processedUnit || 'Liter';

    let itemsList = [];
    if (Array.isArray(packagingItems) && packagingItems.length > 0) {
      itemsList = packagingItems.map(i => ({
        packagingType: i.packagingType || 'Botol',
        size: i.size || '',
        quantity: parseInt(i.quantity, 10) || 0
      })).filter(i => i.quantity > 0);
    }

    let bQty = 0, cQty = 0, pQty = 0, totalPackagedQty = 0;
    let primaryPkgType = null;
    let primaryPkgSize = null;

    if (itemsList.length > 0) {
      primaryPkgType = itemsList[0].packagingType;
      primaryPkgSize = itemsList[0].size;
      itemsList.forEach(item => {
        totalPackagedQty += item.quantity;
        const typeLower = (item.packagingType || '').toLowerCase();
        if (typeLower.includes('botol')) bQty += item.quantity;
        else if (typeLower.includes('cup')) cQty += item.quantity;
        else if (typeLower.includes('plastik') || typeLower.includes('bantal')) pQty += item.quantity;
        else bQty += item.quantity;
      });
    } else {
      totalPackagedQty = existing.totalPackagedQty || 0;
      bQty = existing.botolQty || 0;
      cQty = existing.cupQty || 0;
      pQty = existing.plastikBantalQty || 0;
      primaryPkgType = existing.packagingType;
      primaryPkgSize = existing.packageSize;
    }

    const updated = await prisma.milkPackaging.update({
      where: { id },
      data: {
        date: date ? new Date(date) : existing.date,
        productCategory: pCategory,
        productSubtype: pSubtype,
        origin: pOrigin,
        variant: pVariant,
        animalType: aType,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        processedAmount: pAmount,
        processedUnit: pUnit,
        processedLiters: pUnit === 'Liter' ? pAmount : existing.processedLiters,
        packagingDetails: JSON.stringify(itemsList),
        packagingType: primaryPkgType,
        packageSize: primaryPkgSize,
        botolQty: bQty,
        cupQty: cQty,
        plastikBantalQty: pQty,
        totalPackagedQty,
        quantitySent: totalPackagedQty,
        quantityReceived: totalPackagedQty,
        status: existing.status === 'PERLU_KOREKSI' ? 'DITERIMA' : existing.status,
        notes: notes !== undefined ? notes : existing.notes,
      },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (targetProductionId) {
      try {
        await prisma.$executeRawUnsafe(
          'UPDATE milk_packagings SET productionId = ? WHERE id = ?',
          targetProductionId,
          id
        );
      } catch (rawErr) {
        console.error('Raw SQL productionId update error:', rawErr);
      }
    }

    try {
      await prisma.systemLog.create({
        data: {
          userId: validUserId,
          userEmail: authUser.email || '',
          action: 'UPDATE_PACKAGING',
          details: `Memperbarui data pengemasan ID ${id}: Total ${totalPackagedQty} pcs`,
        },
      });
    } catch (logErr) {}

    return NextResponse.json({
      success: true,
      message: 'Data pengemasan berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    console.error('PUT /api/farm/packaging/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'ADMIN_PENGEMASAN' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = params;
    const existing = await prisma.milkPackaging.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data pengemasan tidak ditemukan' }, { status: 404 });
    }

    if (existing.status === 'MENUNGGU_PENERIMAAN' && authUser.role !== 'SUPERADMIN' && authUser.role !== 'ADMIN_PENGEMASAN') {
      return NextResponse.json({ success: false, message: 'Data yang sedang dalam proses pengiriman tidak dapat dihapus.' }, { status: 400 });
    }

    if (existing.productionId) {
      const pAmount = existing.processedAmount || existing.processedLiters || 0;
      if (pAmount > 0) {
        await prisma.milkProduction.update({
          where: { id: existing.productionId },
          data: {
            processedLiters: {
              decrement: pAmount
            }
          }
        }).catch(err => console.error('Error reverting production processedLiters:', err));
      }
    }

    await prisma.milkPackaging.delete({ where: { id } });

    const validUserId = await resolveValidUserId(authUser);
    try {
      await prisma.systemLog.create({
        data: {
          userId: validUserId,
          userEmail: authUser.email || '',
          action: 'DELETE_PACKAGING',
          details: `Menghapus data pengemasan ID ${id}`,
        },
      });
    } catch (logErr) {}

    return NextResponse.json({
      success: true,
      message: 'Data pengemasan berhasil dihapus & stok susu dikembalikan.',
    });
  } catch (error) {
    console.error('DELETE /api/farm/packaging/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
