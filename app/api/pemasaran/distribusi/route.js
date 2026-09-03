import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/pemasaran/distribusi (Batch submission for Admin Pengemasan Distribusi)
export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    const allowedRoles = ['ADMIN_PENGEMASAN', 'ADMIN_PEMASARAN', 'SUPERADMIN'];

    if (!authUser || !allowedRoles.includes(authUser.role)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Hanya Admin Pengemasan, Admin Pemasaran, atau Superadmin' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      date,
      target = 'SPPG',
      product = 'Susu',
      size = '250 ml',
      packagingType = 'Botol',
      quantity = 0,
      internalMilk = 0,
      internalYogurt = 0,
      externalMilk = 0,
      damagedProduct = 'Susu',
      damagedSize = '250 ml',
      damagedQuantity = 0,
      damagedReason = 'Produk rusak',
      notes = '',
      salesItems = [],
      hibahItems = [],
      afkirItems = [],
    } = body;

    // Default category ID for MilkOutflow
    let defaultCat = await prisma.milkCategory.findFirst();
    if (!defaultCat) {
      defaultCat = await prisma.milkCategory.create({
        data: { name: 'Kategori Umum', description: 'Kategori default pengeluaran' }
      });
    }

    const txDate = date ? new Date(date) : new Date();
    let totalSavedCount = 0;

    // Execute atomic transaction for all records in 1 fast DB commit
    await prisma.$transaction(async (tx) => {
      // 1. Penjualan Items (Multi-item support)
      if (Array.isArray(salesItems) && salesItems.length > 0) {
        for (const item of salesItems) {
          const qty = parseInt(item.quantity, 10) || 0;
          if (qty > 0) {
            const now = Date.now();
            const rand = Math.floor(Math.random() * 1000);
            await tx.milkSale.create({
              data: {
                transactionId: `SALE-${now}-${rand}`,
                date: txDate,
                productCategory: item.product || 'Susu',
                productSubtype: item.product === 'Yogurt' ? 'Yogurt' : 'Susu Pasteurisasi',
                variant: 'Original',
                packagingType: item.packagingType || 'Botol',
                quantity: qty,
                unitPrice: 0,
                totalPrice: 0,
                status: 'Berhasil',
                notes: `[Penjualan ${item.target || 'SPPG'}] Ukuran: ${item.size || '250 ml'}. ${notes}`.trim(),
                createdById: authUser.id,
              },
            });
            totalSavedCount += qty;
          }
        }
      } else {
        const saleQty = parseInt(quantity, 10) || 0;
        if (saleQty > 0) {
          const now = Date.now();
          const rand = Math.floor(Math.random() * 1000);
          await tx.milkSale.create({
            data: {
              transactionId: `SALE-${now}-${rand}`,
              date: txDate,
              productCategory: product,
              productSubtype: product === 'Susu' ? 'Susu Pasteurisasi' : 'Yogurt',
              variant: 'Original',
              packagingType: packagingType || 'Botol',
              quantity: saleQty,
              unitPrice: 0,
              totalPrice: 0,
              status: 'Berhasil',
              notes: `[Penjualan ${target}] Ukuran: ${size}. ${notes}`.trim(),
              createdById: authUser.id,
            },
          });
          totalSavedCount += saleQty;
        }
      }

      // 2. Hibah Items (Multi-item support)
      if (Array.isArray(hibahItems) && hibahItems.length > 0) {
        for (const item of hibahItems) {
          const qty = parseInt(item.quantity, 10) || 0;
          if (qty > 0) {
            const typeStr = item.type || 'Internal - Susu';
            const isYogurt = typeStr.toLowerCase().includes('yogurt');
            const isExternal = typeStr.toLowerCase().includes('eksternal');
            const prodType = isYogurt ? 'OLAHAN' : 'SEGAR';

            await tx.milkOutflow.create({
              data: {
                date: txDate,
                categoryId: defaultCat.id,
                productType: prodType,
                animalType: 'SAPI',
                packagingType: 'botol',
                quantity: qty,
                notes: `[HIBAH ${isExternal ? 'EKSTERNAL' : 'INTERNAL'} - ${isYogurt ? 'Yogurt' : 'Susu'}] Ukuran: ${item.size || '250 ml'}. ${notes}`.trim(),
                createdById: authUser.id,
              },
            });
            totalSavedCount += qty;
          }
        }
      } else {
        const hIntSusu = parseInt(internalMilk, 10) || 0;
        const hIntYogurt = parseInt(internalYogurt, 10) || 0;
        const hEksSusu = parseInt(externalMilk, 10) || 0;

        if (hIntSusu > 0) {
          await tx.milkOutflow.create({
            data: {
              date: txDate,
              categoryId: defaultCat.id,
              productType: 'SEGAR',
              animalType: 'SAPI',
              packagingType: 'botol',
              quantity: hIntSusu,
              notes: `[HIBAH INTERNAL - Susu] Ukuran: ${size}. ${notes}`.trim(),
              createdById: authUser.id,
            },
          });
          totalSavedCount += hIntSusu;
        }
        if (hIntYogurt > 0) {
          await tx.milkOutflow.create({
            data: {
              date: txDate,
              categoryId: defaultCat.id,
              productType: 'OLAHAN',
              animalType: 'SAPI',
              packagingType: 'botol',
              quantity: hIntYogurt,
              notes: `[HIBAH INTERNAL - Yogurt] Ukuran: 200 ml. ${notes}`.trim(),
              createdById: authUser.id,
            },
          });
          totalSavedCount += hIntYogurt;
        }
        if (hEksSusu > 0) {
          await tx.milkOutflow.create({
            data: {
              date: txDate,
              categoryId: defaultCat.id,
              productType: 'SEGAR',
              animalType: 'SAPI',
              packagingType: 'botol',
              quantity: hEksSusu,
              notes: `[HIBAH EKSTERNAL - Susu] Ukuran: ${size}. ${notes}`.trim(),
              createdById: authUser.id,
            },
          });
          totalSavedCount += hEksSusu;
        }
      }

      // 3. Rusak / Afkir Items (Multi-item support)
      if (Array.isArray(afkirItems) && afkirItems.length > 0) {
        for (const item of afkirItems) {
          const qty = parseInt(item.quantity, 10) || 0;
          if (qty > 0) {
            await tx.milkOutflow.create({
              data: {
                date: txDate,
                categoryId: defaultCat.id,
                productType: item.product === 'Yogurt' ? 'OLAHAN' : 'SEGAR',
                animalType: 'SAPI',
                packagingType: 'botol',
                quantity: qty,
                notes: `[RUSAK/AFKIR - ${item.product || 'Susu'} ${item.size || '250 ml'}] Ukuran: ${item.size || '250 ml'}. Alasan: ${item.reason || 'Produk rusak'}. ${notes}`.trim(),
                createdById: authUser.id,
              },
            });
            totalSavedCount += qty;
          }
        }
      } else {
        const afkQty = parseInt(damagedQuantity, 10) || 0;
        if (afkQty > 0) {
          await tx.milkOutflow.create({
            data: {
              date: txDate,
              categoryId: defaultCat.id,
              productType: damagedProduct === 'Susu' ? 'SEGAR' : 'OLAHAN',
              animalType: 'SAPI',
              packagingType: 'botol',
              quantity: afkQty,
              notes: `[RUSAK/AFKIR - ${damagedProduct} ${damagedSize}] Ukuran: ${damagedSize}. Alasan: ${damagedReason}. ${notes}`.trim(),
              createdById: authUser.id,
            },
          });
          totalSavedCount += afkQty;
        }
      }
    });

    if (totalSavedCount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Harap isi minimal 1 transaksi distribusi (> 0 botol).' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Data Distribusi (${totalSavedCount} pcs) berhasil disimpan & stok diperbarui!`,
    });
  } catch (error) {
    console.error('POST /api/pemasaran/distribusi error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal menyimpan data distribusi.' },
      { status: 500 }
    );
  }
}
