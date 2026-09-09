import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_FARM', 'ADMIN_PEMASARAN', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Peran tidak diizinkan.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const whereClause = {};
    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const docs = await prisma.bastDocument.findMany({
      where: whereClause,
      orderBy: { tanggal: 'asc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengambil daftar Surat BAST.',
      data: docs,
    });
  } catch (error) {
    console.error('Error GET /api/bast:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data Surat BAST.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PEMASARAN', 'ADMIN_FARM', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Hanya Admin Pemasaran, Admin Farm, atau Superadmin yang dapat menerbitkan BAST.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      tanggal,
      volumeLiters,
      jenisPermintaan,
      instansiPenerima,
      pengirimNama,
      catatan,
      productionId,
    } = body;

    const numVolume = parseFloat(volumeLiters);
    if (isNaN(numVolume) || numVolume <= 0) {
      return NextResponse.json(
        { success: false, message: 'Volume susu segar (Liter) wajib diisi dan bernilai > 0.' },
        { status: 400 }
      );
    }

    const animal = (body.animalType || body.jenisTernak || (body.sumber === 'SUSU_KAMBING' ? 'KAMBING' : 'SAPI')).toUpperCase();
    const sumberField = body.sumber || (animal === 'KAMBING' ? 'SUSU_KAMBING' : 'SUSU_SAPI');

    const isPemasaran = authUser.role === 'ADMIN_PEMASARAN' || !authUser.role?.includes('FARM');
    const isUhtReq = jenisPermintaan === 'PENGOLAHAN_UHT' || jenisPermintaan === 'PERMINTAAN_PENGOLAHAN_UHT';

    const senderName = (pengirimNama || (isUhtReq ? 'Seksi Pemasaran' : (isPemasaran ? 'Admin Pemasaran' : 'Admin Farm Produksi'))).trim();
    const senderRole = body.pengirimRole || authUser.role || (isPemasaran ? 'ADMIN_PEMASARAN' : 'ADMIN_FARM');
    const receiverName = (body.penerimaNama || (isUhtReq ? 'Unit Pengolahan (UHT)' : (isPemasaran ? 'Unit Farm Produksi BBPTUHPT' : 'Bagian Pemasaran & Stok'))).trim();
    const receiverRole = body.penerimaRole || (isUhtReq ? 'UNIT_PENGOLAHAN_UHT' : (isPemasaran ? 'ADMIN_FARM' : 'ADMIN_PEMASARAN'));

    // Generate unique nomor BAST if not explicitly passed: BA-[TUJUAN]-[YYYYMMDD]-[XXX]
    const dateObj = tanggal ? new Date(tanggal) : new Date();
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    let nomorBast = body.nomorBast;
    if (!nomorBast) {
      const rawTujuan = (
        instansiPenerima ||
        body.tujuan ||
        (isUhtReq ? 'UHT' : (jenisPermintaan === 'HIBAH' ? 'HIBAH' : 'PEMASARAN'))
      ).trim();

      const getTujuanCode = (str) => {
        if (!str) return 'UMUM';
        const clean = str.trim().toUpperCase();
        if (/^[A-Z0-9]{2,8}$/.test(clean)) return clean;
        
        if (clean.includes('SPPG')) return 'SPPG';
        if (clean.includes('EDUKASI') || clean.includes('EDUKAS')) return 'EDUKASI';
        if (clean.includes('KANTIN')) return 'KANTIN';
        if (clean.includes('UHT')) return 'UHT';
        if (clean.includes('POSYANDU')) return 'POSYANDU';
        if (clean.includes('YAYASAN') || clean.includes('PANTI')) return 'YAYASAN';
        if (clean.includes('DINAS') || clean.includes('TAMU')) return 'DINAS';
        if (clean.includes('UMUM')) return 'UMUM';

        const words = clean.split(/[\s\-_/]+/).filter(Boolean);
        if (words.length > 1) {
          const initials = words.map(w => w[0]).join('');
          if (initials.length >= 2 && initials.length <= 5) return initials;
        }

        return clean.replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'UMUM';
      };

      const codeTujuan = getTujuanCode(rawTujuan);

      // Hitung urutan tahunan: ulang dari 1 per tahun
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

      const bastDocsInYear = await prisma.bastDocument.findMany({
        where: {
          tanggal: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        select: {
          nomorBast: true,
        },
      });

      let maxSeq = 0;
      for (const d of bastDocsInYear) {
        if (!d.nomorBast) continue;
        const match = d.nomorBast.match(/[-/](\d{3,})$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq && num < 100000) {
            maxSeq = num;
          }
        }
      }

      let nextSeq = Math.max(maxSeq + 1, 1);
      nomorBast = `BA-${codeTujuan}-${dateStr}-${String(nextSeq).padStart(3, '0')}`;

      // Pastikan unik jika terdapat collision
      while (await prisma.bastDocument.findUnique({ where: { nomorBast } })) {
        nextSeq++;
        nomorBast = `BA-${codeTujuan}-${dateStr}-${String(nextSeq).padStart(3, '0')}`;
      }
    }

    let validUserId = authUser.userId || authUser.id || null;
    if (validUserId) {
      const userExists = await prisma.user.findUnique({ where: { id: validUserId }, select: { id: true } });
      if (!userExists) validUserId = null;
    }

    const newBast = await prisma.bastDocument.create({
      data: {
        nomorBast,
        tanggal: dateObj,
        sumber: sumberField,
        volumeLiters: numVolume,
        jenisPermintaan: jenisPermintaan || 'PENJUALAN_LANGSUNG',
        instansiPenerima: instansiPenerima ? instansiPenerima.trim() : (isUhtReq ? 'Unit Pengolahan (UHT)' : null),
        pengirimNama: senderName,
        pengirimRole: senderRole,
        penerimaNama: receiverName,
        penerimaRole: receiverRole,
        status: body.status || 'MENUNGGU_KONFIRMASI',
        catatan: catatan ? catatan.trim() : null,
        productionId: productionId || null,
        createdById: validUserId,
      },
    });

    // Create Notification for target role
    try {
      const targetRole = isPemasaran ? 'ADMIN_FARM' : 'ADMIN_PEMASARAN';
      const targetLink = isPemasaran ? '/riwayat-produksi' : '/pemasaran/bast';
      await prisma.notification.create({
        data: {
          title: `Permintaan Susu Segar: ${jenisPermintaan || 'BAST'} (${numVolume} L)`,
          message: `${senderName} telah mengajukan permintaan susu segar sebanyak ${numVolume} Liter untuk ${jenisPermintaan || 'keperluan olahan/distribusi'}.`,
          type: 'BAST_CREATED',
          targetRole,
          senderId: authUser.id,
          senderName,
          senderRole,
          link: targetLink,
          metadata: JSON.stringify({
            bastId: newBast.id,
            nomorBast,
            volumeLiters: numVolume,
            jenisPermintaan,
          }),
        },
      });
    } catch (notifErr) {
      console.error('Error creating BAST notification:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Berhasil menerbitkan Surat Berita Acara Serah Terima (BAST) Susu Segar!',
      data: newBast,
    });
  } catch (error) {
    console.error('Error POST /api/bast:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menerbitkan Surat BAST.' },
      { status: 400 }
    );
  }
}
