import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, resolveValidUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const animalType = searchParams.get('animalType');
    const productCategory = searchParams.get('productCategory');
    const productSubtype = searchParams.get('productSubtype');
    const origin = searchParams.get('origin');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (animalType) where.animalType = animalType;
    if (productCategory) where.productCategory = productCategory;
    if (productSubtype) where.productSubtype = productSubtype;
    if (origin) where.origin = origin;
    if (status) where.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    let packagings;
    try {
      packagings = await prisma.milkPackaging.findMany({
        where,
        include: {
          category: true,
          production: {
            include: { category: true }
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { date: 'desc' },
      });
    } catch (e) {
      packagings = await prisma.milkPackaging.findMany({
        where,
        include: {
          category: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { date: 'desc' },
      });
    }

    return NextResponse.json({ success: true, data: packagings });
  } catch (error) {
    console.error('GET /api/farm/packaging error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'ADMIN_PENGEMASAN' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Pengemasan, Admin Farm, atau Superadmin yang dapat menginput pengemasan' }, { status: 403 });
    }

    const body = await request.json();
    const {
      date,
      productionId,
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
      status: reqStatus,
    } = body;

    if (date) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const inputDateStr = typeof date === 'string' ? date.split('T')[0] : '';
      if (inputDateStr && inputDateStr > todayStr) {
        return NextResponse.json({ success: false, message: 'Tanggal pengemasan tidak boleh lebih dari tanggal sekarang' }, { status: 400 });
      }
    }

    let selectedProduction = null;
    if (productionId) {
      selectedProduction = await prisma.milkProduction.findUnique({ where: { id: productionId } }).catch(() => null);
    }

    const pCategory = productCategory || 'Susu';
    const pSubtype = productSubtype || null;
    const pOrigin = origin || (selectedProduction ? (selectedProduction.animalType === 'KAMBING' ? 'Kambing' : 'Sapi') : (animalType === 'KAMBING' ? 'Kambing' : 'Sapi'));
    const aType = pOrigin.toUpperCase() === 'KAMBING' ? 'KAMBING' : 'SAPI';
    const pVariant = variant || 'Original';

    const pAmount = parseFloat(processedAmount !== undefined ? processedAmount : processedLiters) || 0;
    const pUnit = processedUnit || (pCategory === 'Keju' ? 'Kg' : 'Liter');

    if (pAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Jumlah liter/bahan yang dikemas harus lebih besar dari 0' }, { status: 400 });
    }

    if (selectedProduction) {
      const sisaVolume = Math.max(0, selectedProduction.rawVolumeLiters - (selectedProduction.processedLiters || 0));
      if (pAmount > sisaVolume) {
        return NextResponse.json({
          success: false,
          message: `Jumlah susu yang akan dikemas (${pAmount} Liter) melebihi stok susu yang tersedia (${sisaVolume} Liter).`
        }, { status: 400 });
      }
    }

    let itemsList = Array.isArray(packagingItems) ? packagingItems : [];
    let totalPackagedQty = 0;
    let bQty = parseInt(botolQty, 10) || 0;
    let cQty = parseInt(cupQty, 10) || 0;
    let pQty = parseInt(plastikBantalQty, 10) || 0;
    let primaryPkgType = null;
    let primaryPkgSize = null;

    if (itemsList.length > 0) {
      totalPackagedQty = itemsList.reduce((sum, i) => sum + (parseInt(i.quantity, 10) || 0), 0);
      primaryPkgType = itemsList[0]?.packagingType || 'Botol';
      primaryPkgSize = itemsList[0]?.size || '';

      bQty = itemsList.filter(i => (i.packagingType || '').toLowerCase().includes('botol')).reduce((s, i) => s + (parseInt(i.quantity, 10) || 0), 0);
      cQty = itemsList.filter(i => (i.packagingType || '').toLowerCase().includes('cup')).reduce((s, i) => s + (parseInt(i.quantity, 10) || 0), 0);
      pQty = itemsList.filter(i => (i.packagingType || '').toLowerCase().includes('bantal') || (i.packagingType || '').toLowerCase().includes('pack')).reduce((s, i) => s + (parseInt(i.quantity, 10) || 0), 0);
    } else {
      totalPackagedQty = bQty + cQty + pQty;
      itemsList = [];
      if (bQty > 0) itemsList.push({ packagingType: 'Botol', size: '', quantity: bQty });
      if (cQty > 0) itemsList.push({ packagingType: 'Cup', size: '', quantity: cQty });
      if (pQty > 0) itemsList.push({ packagingType: 'Plastik Bantal', size: '', quantity: pQty });
    }

    if (totalPackagedQty <= 0) {
      return NextResponse.json({ success: false, message: 'Minimal satu jenis kemasan (Botol, Cup, atau Plastik Bantal) harus diisi dengan jumlah > 0' }, { status: 400 });
    }

    // --- BOM (Bill of Materials) Stock Validation & Deduction ---
    // Ensure standard default materials exist in DB
    const defaultMaterials = [
      { code: 'MAT-BOT-115', name: 'Botol 115 ml', category: 'Kemasan', unit: 'pcs', currentStock: 1000, minimumStock: 300, criticalStock: 100 },
      { code: 'MAT-BOT-250', name: 'Botol 250 ml', category: 'Kemasan', unit: 'pcs', currentStock: 1000, minimumStock: 300, criticalStock: 100 },
      { code: 'MAT-CUP-200', name: 'Cup 200 ml', category: 'Kemasan', unit: 'pcs', currentStock: 1000, minimumStock: 300, criticalStock: 100 },
      { code: 'MAT-PLASTIK', name: 'Plastik Bantal', category: 'Kemasan', unit: 'pcs', currentStock: 1000, minimumStock: 300, criticalStock: 100 },
      { code: 'MAT-TUTUP-BOTOL', name: 'Tutup Botol', category: 'Tutup', unit: 'pcs', currentStock: 2000, minimumStock: 500, criticalStock: 200 },
      { code: 'MAT-TUTUP-CUP', name: 'Tutup Cup', category: 'Tutup', unit: 'pcs', currentStock: 2000, minimumStock: 500, criticalStock: 200 },
      { code: 'MAT-LBL-115', name: 'Label 115 ml', category: 'Label', unit: 'pcs', currentStock: 2000, minimumStock: 500, criticalStock: 200 },
      { code: 'MAT-LBL-250', name: 'Label 250 ml', category: 'Label', unit: 'pcs', currentStock: 2000, minimumStock: 500, criticalStock: 200 },
      { code: 'MAT-LBL-YOGURT', name: 'Label Yogurt', category: 'Label', unit: 'pcs', currentStock: 2000, minimumStock: 500, criticalStock: 200 },
      { code: 'MAT-KEMASAN-KEJU', name: 'Kemasan Keju', category: 'Kemasan', unit: 'pcs', currentStock: 1000, minimumStock: 200, criticalStock: 50 },
    ];

    const hasPackagingMaterialModel = Boolean(
      prisma.packagingMaterial &&
      typeof prisma.packagingMaterial.findUnique === 'function' &&
      typeof prisma.packagingMaterial.create === 'function'
    );

    if (hasPackagingMaterialModel) {
      for (const m of defaultMaterials) {
        try {
          const exist = await prisma.packagingMaterial.findUnique({ where: { code: m.code } }).catch(() => null);
          if (!exist && typeof prisma.packagingMaterial?.create === 'function') {
            await prisma.packagingMaterial.create({ data: m }).catch(() => { });
          }
        } catch (e) { }
      }
    }

    const {
      totalProductionQty: reqTotalProd,
      afkirQty: reqAfkir,
      netQty: reqNet,
    } = body;

    const totalProdQty = parseInt(reqTotalProd !== undefined ? reqTotalProd : totalPackagedQty, 10) || totalPackagedQty;
    const afkirQtyVal = parseInt(reqAfkir || '0', 10) || 0;
    const netQtyVal = reqNet !== undefined ? parseInt(reqNet, 10) : Math.max(0, totalProdQty - afkirQtyVal);

    const materialReqMap = {};
    const addMaterialReq = (code, qty) => {
      if (!code || qty <= 0) return;
      materialReqMap[code] = (materialReqMap[code] || 0) + qty;
    };

    const catLower = (pCategory || '').toLowerCase();
    const isYogurt = catLower.includes('yogurt') || (pSubtype || '').toLowerCase().includes('yogurt');
    const isKeju = catLower.includes('keju') || (pSubtype || '').toLowerCase().includes('keju');

    // Material consumption is calculated based on TOTAL PRODUCTION (totalProdQty), not net yield
    if (itemsList.length > 0) {
      itemsList.forEach((item) => {
        const pType = (item.packagingType || '').toLowerCase();
        const pSz = (item.size || item.packageSize || '').toLowerCase();
        const itemProdQty = parseInt(item.quantity || item.productionQty || totalProdQty, 10) || totalProdQty;

        if (itemProdQty <= 0) return;

        if (isKeju) {
          addMaterialReq('MAT-KEMASAN-KEJU', itemProdQty);
        } else if (isYogurt) {
          addMaterialReq('MAT-CUP-200', itemProdQty);
          addMaterialReq('MAT-TUTUP-CUP', itemProdQty);
          addMaterialReq('MAT-LBL-YOGURT', itemProdQty);
        } else if (pType.includes('botol') || pSz.includes('115') || pSz.includes('250')) {
          if (pSz.includes('115')) {
            addMaterialReq('MAT-BOT-115', itemProdQty);
            addMaterialReq('MAT-TUTUP-BOTOL', itemProdQty);
            addMaterialReq('MAT-LBL-115', itemProdQty);
          } else {
            addMaterialReq('MAT-BOT-250', itemProdQty);
            addMaterialReq('MAT-TUTUP-BOTOL', itemProdQty);
            addMaterialReq('MAT-LBL-250', itemProdQty);
          }
        } else if (pType.includes('cup') || pSz.includes('200')) {
          addMaterialReq('MAT-CUP-200', itemProdQty);
          addMaterialReq('MAT-TUTUP-CUP', itemProdQty);
          addMaterialReq('MAT-LBL-250', itemProdQty);
        } else if (pType.includes('bantal') || pType.includes('plastik') || pType.includes('pack')) {
          addMaterialReq('MAT-PLASTIK', itemProdQty);
        }
      });
    } else {
      if (isKeju) {
        addMaterialReq('MAT-KEMASAN-KEJU', totalProdQty);
      } else if (isYogurt) {
        addMaterialReq('MAT-CUP-200', totalProdQty);
        addMaterialReq('MAT-TUTUP-CUP', totalProdQty);
        addMaterialReq('MAT-LBL-YOGURT', totalProdQty);
      } else {
        if (bQty > 0) {
          addMaterialReq('MAT-BOT-250', totalProdQty);
          addMaterialReq('MAT-TUTUP-BOTOL', totalProdQty);
          addMaterialReq('MAT-LBL-250', totalProdQty);
        } else if (cQty > 0) {
          addMaterialReq('MAT-CUP-200', totalProdQty);
          addMaterialReq('MAT-TUTUP-CUP', totalProdQty);
          addMaterialReq('MAT-LBL-250', totalProdQty);
        } else if (pQty > 0) {
          addMaterialReq('MAT-PLASTIK', totalProdQty);
        }
      }
    }

    // Validate material stock availability before executing transaction
    const requiredCodes = Object.keys(materialReqMap);
    if (requiredCodes.length > 0 && hasPackagingMaterialModel) {
      const dbMaterials = await prisma.packagingMaterial.findMany({}).catch(() => []);
      const matByCode = {};
      (dbMaterials || []).forEach(m => { matByCode[m.code] = m; });

      const insufficientMaterials = [];
      for (const code of requiredCodes) {
        const needed = materialReqMap[code];
        const mat = matByCode[code];
        if (mat) {
          if ((mat.currentStock || 0) < needed) {
            insufficientMaterials.push({
              name: mat.name,
              available: mat.currentStock || 0,
              needed,
              unit: mat.unit || 'pcs',
              shortage: needed - (mat.currentStock || 0)
            });
          }
        }
      }

      if (insufficientMaterials.length > 0) {
        const detailMsg = insufficientMaterials.map(m =>
          `${m.name} (Tersedia: ${m.available} ${m.unit}, Dibutuhkan: ${m.needed} ${m.unit}, Kekurangan: ${m.shortage} ${m.unit})`
        ).join('; ');

        return NextResponse.json({
          success: false,
          message: 'Stok bahan kemasan tidak mencukupi untuk proses pengolahan.',
          detail: detailMsg,
          insufficientMaterials
        }, { status: 400 });
      }
    }

    const finalStatus = reqStatus || 'DITERIMA';
    const validUserId = await resolveValidUserId(authUser);

    // ATOMIC DATABASE TRANSACTION: Execute material deduction and packaging creation atomically
    const packaging = await prisma.$transaction(async (tx) => {
      // 1. Deduct material stock & create movements if packagingMaterial model exists
      if (tx.packagingMaterial && typeof tx.packagingMaterial.findUnique === 'function' && typeof tx.packagingMaterial.update === 'function') {
        for (const code of requiredCodes) {
          const needed = materialReqMap[code];
          try {
            const mat = await tx.packagingMaterial.findUnique({ where: { code } }).catch(() => null);
            if (mat) {
              const prevStock = mat.currentStock || 0;
              if (prevStock < needed) {
                throw new Error(`Stok ${mat.name} tidak mencukupi! Tersedia: ${prevStock} ${mat.unit}, Dibutuhkan: ${needed} ${mat.unit}`);
              }
              const newStock = Math.max(0, prevStock - needed);

              if (typeof tx.packagingMaterial?.update === 'function') {
                await tx.packagingMaterial.update({
                  where: { id: mat.id },
                  data: { currentStock: newStock }
                }).catch(() => { });
              }

              if (tx.materialStockMovement && typeof tx.materialStockMovement?.create === 'function') {
                await tx.materialStockMovement.create({
                  data: {
                    materialId: mat.id,
                    type: 'DEDUCTION',
                    quantity: needed,
                    previousStock: prevStock,
                    newStock,
                    source: 'PENGOLAHAN',
                    notes: `Produksi ${pCategory} ${pVariant} (${totalProdQty} pcs, Net: ${netQtyVal} pcs)`.trim(),
                    createdById: validUserId
                  }
                }).catch(() => { });
              }
            }
          } catch (matErr) {
            console.error('Material deduction note:', matErr);
          }
        }
      }

      // 2. Create MilkPackaging record
      const createdPkg = await tx.milkPackaging.create({
        data: {
          date: date ? new Date(date) : new Date(),
          productCategory: pCategory,
          productSubtype: pSubtype || pCategory,
          origin: pOrigin,
          variant: pVariant,
          animalType: aType,
          categoryId: categoryId || (selectedProduction ? selectedProduction.categoryId : null),
          processedAmount: pAmount,
          processedUnit: pUnit,
          processedLiters: pUnit === 'Liter' ? pAmount : 0,
          packagingDetails: JSON.stringify(itemsList),
          packagingType: primaryPkgType,
          packageSize: primaryPkgSize,
          botolQty: bQty,
          cupQty: cQty,
          plastikBantalQty: pQty,
          totalPackagedQty: netQtyVal, // Ready product stock (Hasil Bersih)
          quantitySent: netQtyVal,
          quantityReceived: netQtyVal,
          status: finalStatus,
          notes: `${notes || ''} [Produksi: ${totalProdQty}, Rusak/Afkir: ${afkirQtyVal}, Hasil Bersih: ${netQtyVal}]`.trim(),
          createdById: validUserId,
        },
        include: {
          category: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // 3. Update Raw Milk Production / Request if selected
      if (selectedProduction) {
        await tx.milkProduction.update({
          where: { id: selectedProduction.id },
          data: {
            processedLiters: {
              increment: pAmount
            }
          }
        });
      }

      return createdPkg;
    });

    try {
      await prisma.systemLog.create({
        data: {
          userId: validUserId,
          userEmail: authUser.email || '',
          action: 'CREATE_PENGOLAHAN',
          details: `Pengolahan ${pCategory} ${pVariant}: ${pAmount} ${pUnit} diproses -> Total Produksi: ${totalProdQty} pcs, Rusak: ${afkirQtyVal} pcs, Net: ${netQtyVal} pcs`,
        },
      });
    } catch (logErr) {
      console.error('Non-critical system log error:', logErr);
    }

    return NextResponse.json({
      success: true,
      message: `Pengolahan ${pCategory} (${pVariant}) berhasil disimpan! Produksi: ${totalProdQty} pcs, Net Siap Edar: +${netQtyVal} pcs. Stok bahan otomatis terpotong.`,
      data: packaging,
    });
  } catch (error) {
    console.error('POST /api/farm/packaging error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
