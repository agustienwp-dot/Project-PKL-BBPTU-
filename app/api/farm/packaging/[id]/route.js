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
      if (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Farm yang dapat mengirim ke Pemasaran' }, { status: 403 });
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

      await prisma.systemLog.create({
        data: {
          userId: validUserId,
          userEmail: authUser.email,
          action: 'SEND_PACKAGING',
          details: `Mengirim pengemasan ID ${id} (${existing.totalPackagedQty} pcs) ke Admin Pemasaran`,
        },
      });

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

      await prisma.systemLog.create({
        data: {
          userId: validUserId,
          userEmail: authUser.email,
          action: 'RECEIVE_PACKAGING',
          details: `Admin Pemasaran mengonfirmasi penerimaan ID ${id}: Diterima ${qRec} pcs (Kondisi: ${condition || 'Sesuai'})`,
        },
      });

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

      await prisma.systemLog.create({
        data: {
          userId: validUserId,
          userEmail: authUser.email,
          action: 'REJECT_PACKAGING',
          details: `Admin Pemasaran meminta koreksi data pengemasan ID ${id}: ${receptionNotes || '-'}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Permintaan koreksi telah dikirim kembali ke Admin Farm',
        data: updated,
      });
    }

    // STANDARD EDIT / UPDATE FORM BY FARM ADMIN
    if (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    // Lock check for editing
    if ((existing.status === 'MENUNGGU_PENERIMAAN' || existing.status === 'DITERIMA') && authUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Data yang sedang menunggu penerimaan atau sudah diterima tidak dapat diubah.' }, { status: 400 });
    }

    const {
      date,
      productCategory,
      productSubtype,
      origin,
      variant,
      animalType,
      categoryId,
      processedAmount,
      processedUnit,
      processedLiters,
      packagingItems,
      botolQty,
      cupQty,
      plastikBantalQty,
      notes,
    } = body;

    const pCategory = productCategory !== undefined ? productCategory : (existing.productCategory || 'Susu');
    const pSubtype = productSubtype !== undefined ? productSubtype : existing.productSubtype;
    const pOrigin = origin !== undefined ? origin : (existing.origin || (existing.animalType === 'KAMBING' ? 'Kambing' : 'Sapi'));
    const aType = pOrigin.toUpperCase() === 'KAMBING' ? 'KAMBING' : 'SAPI';
    const pVariant = variant !== undefined ? variant : (existing.variant || 'Original');

    const pAmount = processedAmount !== undefined ? parseFloat(processedAmount) || 0 : (processedLiters !== undefined ? parseFloat(processedLiters) || 0 : existing.processedAmount || existing.processedLiters || 0);
    const pUnit = processedUnit !== undefined ? processedUnit : (existing.processedUnit || (pCategory === 'Keju' ? 'Kg' : 'Liter'));

    if (pAmount < 0) {
      return NextResponse.json({ success: false, message: 'Jumlah bahan diproses tidak boleh bernilai negatif' }, { status: 400 });
    }

    let itemsList = Array.isArray(packagingItems) ? packagingItems : null;
    let totalPackagedQty = 0;
    let bQty = botolQty !== undefined ? parseInt(botolQty, 10) || 0 : existing.botolQty;
    let cQty = cupQty !== undefined ? parseInt(cupQty, 10) || 0 : existing.cupQty;
    let pQty = plastikBantalQty !== undefined ? parseInt(plastikBantalQty, 10) || 0 : existing.plastikBantalQty;
    let primaryPkgType = existing.packagingType;
    let primaryPkgSize = existing.packageSize;

    if (itemsList) {
      totalPackagedQty = itemsList.reduce((sum, i) => sum + (parseInt(i.quantity, 10) || 0), 0);
      primaryPkgType = itemsList[0]?.packagingType || 'Botol';
      primaryPkgSize = itemsList[0]?.size || '';
      
      bQty = itemsList.filter(i => (i.packagingType || '').toLowerCase().includes('botol')).reduce((s, i) => s + (parseInt(i.quantity, 10) || 0), 0);
      cQty = itemsList.filter(i => (i.packagingType || '').toLowerCase().includes('cup')).reduce((s, i) => s + (parseInt(i.quantity, 10) || 0), 0);
      pQty = itemsList.filter(i => (i.packagingType || '').toLowerCase().includes('bantal')).reduce((s, i) => s + (parseInt(i.quantity, 10) || 0), 0);
    } else {
      totalPackagedQty = bQty + cQty + pQty;
      itemsList = existing.packagingDetails ? JSON.parse(existing.packagingDetails) : [];
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
        status: existing.status === 'PERLU_KOREKSI' ? 'DRAFT' : existing.status,
        notes: notes !== undefined ? notes : existing.notes,
      },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await prisma.systemLog.create({
      data: {
        userId: validUserId,
        userEmail: authUser.email,
        action: 'UPDATE_PACKAGING',
        details: `Memperbarui data pengemasan ID ${id}: Total ${totalPackagedQty} pcs`,
      },
    });

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
    if (!authUser || (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = params;

    const existing = await prisma.milkPackaging.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data pengemasan tidak ditemukan' }, { status: 404 });
    }

    if ((existing.status === 'MENUNGGU_PENERIMAAN' || existing.status === 'DITERIMA') && authUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Data yang sedang dalam proses pengiriman atau sudah diterima tidak dapat dihapus.' }, { status: 400 });
    }

    await prisma.milkPackaging.delete({ where: { id } });

    const validUserId = await resolveValidUserId(authUser);
    await prisma.systemLog.create({
      data: {
        userId: validUserId,
        userEmail: authUser.email,
        action: 'DELETE_PACKAGING',
        details: `Menghapus data pengemasan ID ${id}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data pengemasan berhasil dihapus',
    });
  } catch (error) {
    console.error('DELETE /api/farm/packaging/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

