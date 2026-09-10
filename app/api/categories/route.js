import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productType = searchParams.get('productType');

    const where = {};
    if (productType) where.productType = productType;

    const categories = await prisma.milkCategory.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    const fallbackCategories = [
      { id: 'cat-sapi', name: 'Susu Sapi Segar', code: 'SSS', productType: 'SEGAR', animalType: 'SAPI', defaultPackaging: 'botol' },
      { id: 'cat-kambing', name: 'Susu Kambing Segar', code: 'SKS', productType: 'SEGAR', animalType: 'KAMBING', defaultPackaging: 'botol' }
    ];
    return NextResponse.json({ success: true, data: fallbackCategories });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'SUPERADMIN' && authUser.role !== 'ADMIN_FARM')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Superadmin atau Admin Farm yang dapat menambah kategori' }, { status: 403 });
    }

    const { name, code, productType, animalType, defaultPackaging, description } = await request.json();

    if (!name || !code) {
      return NextResponse.json({ success: false, message: 'Nama dan kode kategori wajib diisi' }, { status: 400 });
    }

    const uppercaseCode = code.trim().toUpperCase();

    const existingCode = await prisma.milkCategory.findUnique({ where: { code: uppercaseCode } });
    if (existingCode) {
      return NextResponse.json({ success: false, message: `Kode kategori '${uppercaseCode}' sudah digunakan` }, { status: 400 });
    }

    const category = await prisma.milkCategory.create({
      data: {
        name,
        code: uppercaseCode,
        animalType: animalType || 'SAPI',
        productType: productType || 'SEGAR',
        defaultPackaging: defaultPackaging || 'botol',
        description,
      },
    });

    await prisma.systemLog.create({
      data: {
        userId: authUser.id,
        userEmail: authUser.email,
        action: 'CREATE_CATEGORY',
        details: `Menambahkan kategori ${category.productType} '${name}' (${uppercaseCode})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Kategori '${name}' (${category.product_type}) berhasil ditambahkan`,
      data: category,
    });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
