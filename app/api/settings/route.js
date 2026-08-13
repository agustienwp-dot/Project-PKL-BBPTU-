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

    const settings = await prisma.farmSetting.findMany();
    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    // Default fallbacks if not present
    if (!settingsObj.batas_umur_distribusi) settingsObj.batas_umur_distribusi = '1.5';
    if (!settingsObj.batas_umur_afkir) settingsObj.batas_umur_afkir = '7.0';

    return NextResponse.json({ success: true, data: settingsObj });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'SUPERADMIN' && authUser.role !== 'ADMIN_TERNAK')) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Membutuhkan hak akses Admin.' }, { status: 403 });
    }

    const { batas_umur_distribusi, batas_umur_afkir } = await request.json();

    if (batas_umur_distribusi !== undefined) {
      await prisma.farmSetting.upsert({
        where: { key: 'batas_umur_distribusi' },
        update: { value: String(batas_umur_distribusi) },
        create: { key: 'batas_umur_distribusi', value: String(batas_umur_distribusi), description: 'Batas umur maksimal (tahun) untuk Distribusi' },
      });
    }

    if (batas_umur_afkir !== undefined) {
      await prisma.farmSetting.upsert({
        where: { key: 'batas_umur_afkir' },
        update: { value: String(batas_umur_afkir) },
        create: { key: 'batas_umur_afkir', value: String(batas_umur_afkir), description: 'Batas umur minimal (tahun) untuk Afkir' },
      });
    }

    await prisma.systemLog.create({
      data: {
        userEmail: authUser.email,
        action: 'UPDATE_SETTINGS',
        level: 'INFO',
        details: `Mengubah threshold umur ternak: Distribusi=${batas_umur_distribusi} th, Afkir=${batas_umur_afkir} th`,
      },
    });

    return NextResponse.json({ success: true, message: 'Pengaturan batas umur ternak berhasil disimpan!' });
  } catch (error) {
    console.error('POST /api/settings error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
