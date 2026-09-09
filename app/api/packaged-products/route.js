import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PEMASARAN', 'SUPERADMIN', 'ADMIN_PENGEMASAN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Peran tidak diizinkan.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const whereClause = {};
    if (statusParam && statusParam !== 'ALL') {
      whereClause.status = statusParam.toUpperCase();
    }

    const packagedProducts = await prisma.packagedProduct.findMany({
      where: whereClause,
      orderBy: { tanggal: sortOrder === 'desc' ? 'desc' : 'asc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengambil data produk olahan.',
      data: packagedProducts,
    });
  } catch (error) {
    console.error('Error GET /api/packaged-products:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data produk olahan.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PENGEMASAN', 'ADMIN_PEMASARAN', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Hanya Admin Pengemasan, Pemasaran, atau Superadmin yang dapat menambah hasil olahan.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      tanggal,
      jenisProduk,
      kemasan,
      jumlah,
      notes,
    } = body;

    const numJumlah = parseFloat(jumlah);
    if (!jenisProduk || !jenisProduk.trim()) {
      return NextResponse.json(
        { success: false, message: 'Jenis produk olahan wajib dipilih (Susu Rasa, Keju, Yogurt).' },
        { status: 400 }
      );
    }

    if (!kemasan || !kemasan.trim()) {
      return NextResponse.json(
        { success: false, message: 'Ukuran kemasan wajib dipilih (250 ml, 110 ml, Cup, dll).' },
        { status: 400 }
      );
    }

    if (isNaN(numJumlah) || numJumlah <= 0) {
      return NextResponse.json(
        { success: false, message: 'Jumlah produk olahan harus bernilai > 0.' },
        { status: 400 }
      );
    }

    const dateObj = tanggal ? new Date(tanggal) : new Date();

    const newProduct = await prisma.packagedProduct.create({
      data: {
        tanggal: dateObj,
        jenisProduk: jenisProduk.trim(),
        kemasan: kemasan.trim(),
        jumlah: numJumlah,
        status: 'DITERIMA',
        receivedAt: new Date(),
        receivedByName: 'Otomatis Masuk Stok',
        condition: 'Sesuai',
        notes: notes ? notes.trim() : null,
        createdById: authUser.userId || authUser.id || null,
      },
    });

    // Create Notification for Admin Pemasaran
    try {
      await prisma.notification.create({
        data: {
          title: `Stok Produk Olahan: ${jenisProduk.trim()} (${kemasan.trim()})`,
          message: `${authUser.name || 'Admin Pengolahan'} telah menambahkan stok ${jenisProduk.trim()} (${kemasan.trim()}) sebanyak ${numJumlah} pcs ke stok Pemasaran.`,
          type: 'STOCK_ADDED',
          targetRole: 'ADMIN_PEMASARAN',
          senderId: authUser.userId || authUser.id || null,
          senderName: authUser.name || authUser.email,
          senderRole: authUser.role || 'ADMIN_PENGEMASAN',
          link: '/pemasaran/terima-data',
          metadata: JSON.stringify({
            productId: newProduct.id,
            jenisProduk: jenisProduk.trim(),
            kemasan: kemasan.trim(),
            jumlah: numJumlah,
          }),
        },
      });
    } catch (notifErr) {
      console.error('Error creating notification in POST /api/packaged-products:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Berhasil menginput data produk olahan dan langsung masuk ke stok pemasaran!',
      data: newProduct,
    });
  } catch (error) {
    console.error('Error POST /api/packaged-products:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menyimpan data pengemasan produk olahan.' },
      { status: 400 }
    );
  }
}
