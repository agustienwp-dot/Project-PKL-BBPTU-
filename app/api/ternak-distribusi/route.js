import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { calculateExcelDatedif, evaluateRecommendation } from '@/lib/datedif';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmFilter = searchParams.get('farm') || '';
    const sexFilter = searchParams.get('sex') || '';
    const recFilter = searchParams.get('recommendation') || '';
    const sortByAge = searchParams.get('sortByAge') || ''; // 'asc' | 'desc'

    // Fetch settings
    const settingsList = await prisma.farmSetting.findMany();
    const settings = {};
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });

    const where = {};
    if (farmFilter) where.farm = farmFilter;
    if (sexFilter) where.gender = sexFilter;

    const animals = await prisma.animal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        cage: { select: { name: true, location: true } },
      },
    });

    // Calculate real-time DATEDIF age & evaluation
    let formattedData = animals.map((a) => {
      const ageInfo = calculateExcelDatedif(a.birthDate);
      const evalInfo = evaluateRecommendation(ageInfo, settings, a);

      return {
        ...a,
        ageFormatted: ageInfo.formatted,
        ageYears: ageInfo.years,
        ageMonths: ageInfo.months,
        ageDays: ageInfo.days,
        totalAgeYearsDecimal: ageInfo.totalYears,
        recommendation: evalInfo.recommendation,
        isManualOverride: evalInfo.isManual,
        sourceLabel: evalInfo.sourceLabel,
      };
    });

    // Filter by Recommendation if specified
    if (recFilter) {
      formattedData = formattedData.filter((item) => item.recommendation.toLowerCase() === recFilter.toLowerCase());
    }

    // Sort by Age (Termuda <-> Tertua)
    if (sortByAge === 'asc') {
      formattedData.sort((a, b) => a.totalAgeYearsDecimal - b.totalAgeYearsDecimal);
    } else if (sortByAge === 'desc') {
      formattedData.sort((a, b) => b.totalAgeYearsDecimal - a.totalAgeYearsDecimal);
    }

    return NextResponse.json({
      success: true,
      data: formattedData,
      settings: {
        batas_umur_distribusi: settings.batas_umur_distribusi || '1.5',
        batas_umur_afkir: settings.batas_umur_afkir || '7.0',
      },
    });
  } catch (error) {
    console.error('GET /api/ternak-distribusi error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { farm, code, name, type, breed, gender, birthDate, weight, notes, isManualOverride, manualRecommendation } = await request.json();

    if (!farm || !code || !birthDate || !gender) {
      return NextResponse.json({ success: false, message: 'Farm, No Sapi (Kode), Tanggal Lahir, dan Sex wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.animal.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ success: false, message: `No Sapi "${code}" sudah terdaftar dalam sistem` }, { status: 400 });
    }

    const newAnimal = await prisma.animal.create({
      data: {
        code,
        farm,
        name: name || `Sapi ${code}`,
        type: type || 'Sapi Perah',
        breed: breed || 'Friesian Holstein',
        gender,
        birthDate: new Date(birthDate),
        weight: weight ? parseFloat(weight) : 0,
        notes: notes || null,
        isManualOverride: Boolean(isManualOverride),
        manualRecommendation: manualRecommendation || null,
      },
    });

    return NextResponse.json({ success: true, message: 'Data ternak berhasil ditambahkan', data: newAnimal }, { status: 201 });
  } catch (error) {
    console.error('POST /api/ternak-distribusi error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id, isManualOverride, manualRecommendation, farm, code, birthDate, gender, weight, notes } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'id ternak wajib disertakan' }, { status: 400 });
    }

    const updated = await prisma.animal.update({
      where: { id },
      data: {
        ...(farm ? { farm } : {}),
        ...(code ? { code } : {}),
        ...(birthDate ? { birthDate: new Date(birthDate) } : {}),
        ...(gender ? { gender } : {}),
        ...(weight !== undefined ? { weight: parseFloat(weight) } : {}),
        ...(notes !== undefined ? { notes } : {}),
        isManualOverride: isManualOverride !== undefined ? Boolean(isManualOverride) : false,
        manualRecommendation: manualRecommendation !== undefined ? manualRecommendation : null,
      },
    });

    return NextResponse.json({ success: true, message: 'Data ternak / rekomendasi berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('PUT /api/ternak-distribusi error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
