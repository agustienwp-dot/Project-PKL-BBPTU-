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

    const certs = await prisma.officialCertificate.findMany({
      orderBy: { issuedAt: 'desc' },
      include: {
        serviceRequest: true,
      },
    });

    return NextResponse.json({ success: true, data: certs });
  } catch (error) {
    console.error('GET /api/pelayanan/certificates error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_PELAYANAN' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Hanya ADMIN PELAYANAN / SUPERADMIN.' }, { status: 403 });
    }

    const { certType, serviceRequestId, ownerName, animalSummary, originAddress, destAddress, validDays } = await request.json();

    if (!certType || !ownerName || !animalSummary || !originAddress) {
      return NextResponse.json({ success: false, message: 'Semua field wajib diisi' }, { status: 400 });
    }

    const count = await prisma.officialCertificate.count();
    const prefix = certType === 'SKKH' ? 'SKKH' : 'ILLT';
    const certNumber = `${prefix}/2026/${String(count + 101).padStart(4, '0')}`;

    const days = parseInt(validDays || '14', 10);
    const validUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const newCert = await prisma.officialCertificate.create({
      data: {
        certNumber,
        certType,
        serviceRequestId: serviceRequestId || null,
        ownerName,
        animalSummary,
        originAddress,
        destAddress: destAddress || 'Tujuan Lokal',
        validUntil,
        issuedBy: `${authUser.name} (${authUser.role})`,
        status: 'RESMI',
      },
    });

    // Update service request if linked
    if (serviceRequestId) {
      await prisma.serviceRequest.update({
        where: { id: serviceRequestId },
        data: { status: 'APPROVED' },
      });
    }

    return NextResponse.json({ success: true, message: `Surat ${certType} berhasil diterbitkan!`, data: newCert }, { status: 201 });
  } catch (error) {
    console.error('POST /api/pelayanan/certificates error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
