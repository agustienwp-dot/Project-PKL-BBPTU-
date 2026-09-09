import { NextResponse } from 'next/server';
import prisma, { isDbOffline } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (isDbOffline()) {
      throw new Error('DB_OFFLINE');
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let whereClause = {};
    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    const materials = (prisma.packagingMaterial && typeof prisma.packagingMaterial.findMany === 'function')
      ? await prisma.packagingMaterial.findMany({ where: whereClause, orderBy: { name: 'asc' } }).catch(() => [])
      : [];

    const movements = (prisma.materialStockMovement && typeof prisma.materialStockMovement.findMany === 'function')
      ? await prisma.materialStockMovement.findMany({ 
          take: 50, 
          include: { material: true },
          orderBy: { createdAt: 'desc' } 
        }).catch(() => [])
      : [];

    // Compute status and low stock counts
    let amanCount = 0;
    let menipisCount = 0;
    let kritisCount = 0;

    const enrichedMaterials = (materials || []).map(mat => {
      let status = 'Aman';
      if (mat.currentStock <= mat.criticalStock) {
        status = 'Kritis';
        kritisCount++;
      } else if (mat.currentStock <= mat.minimumStock) {
        status = 'Menipis';
        menipisCount++;
      } else {
        amanCount++;
      }
      return {
        ...mat,
        status
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        materials: enrichedMaterials,
        movements,
        summary: {
          totalMaterials: enrichedMaterials.length,
          amanCount,
          menipisCount,
          kritisCount,
          warningCount: menipisCount + kritisCount
        }
      }
    });
  } catch (error) {
    console.error('Error fetching material stock:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
