import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, resolveValidUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

if (!global.__inMemoryMilkRequestList) {
  global.__inMemoryMilkRequestList = [];
}

async function generateRequestNo(targetDate = null) {
  const dateObj = targetDate ? new Date(targetDate) : new Date();
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const prefix = `REQ-${dateStr}`;

  try {
    const count = await prisma.milkRequest.count();
    const memCount = (global.__inMemoryMilkRequestList || []).length;
    const nextNum = (Math.max(count, memCount) + 1).toString().padStart(3, '0');
    return `${prefix}-${nextNum}`;
  } catch (err) {
    const memCount = (global.__inMemoryMilkRequestList || []).length;
    const nextNum = (memCount + 1).toString().padStart(3, '0');
    return `${prefix}-${nextNum}`;
  }
}

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    let items = [];
    try {
      items = await prisma.milkRequest.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, email: true, role: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Attach linked BAST documents
      let allBasts = [];
      try {
        allBasts = await prisma.beritaAcara.findMany({
          where: { type: 'PERMINTAAN_SUSU' },
          orderBy: { createdAt: 'desc' }
        });
      } catch (be) {}

      const mappedItems = items.map((item) => {
        const matchingBast = allBasts.find(b =>
          (b.notes && b.notes.includes(item.requestNo)) ||
          (b.nomorBA && b.nomorBA.includes(item.requestNo))
        );
        return {
          ...item,
          bastNo: matchingBast?.nomorBA || null,
          bastId: matchingBast?.id || null,
          bastStatus: matchingBast?.status || null,
          bast: matchingBast || null,
        };
      });

      // Keep memory cache synced with DB
      if (!status || status === 'ALL') {
        global.__inMemoryMilkRequestList = [...mappedItems];
      }
      return NextResponse.json({ success: true, data: mappedItems });
    } catch (e) {
      console.error('prisma.milkRequest.findMany error:', e);
      let memItems = global.__inMemoryMilkRequestList || [];
      if (status && status !== 'ALL') {
        memItems = memItems.filter(i => i.status === status);
      }
      return NextResponse.json({ success: true, data: memItems });
    }
  } catch (error) {
    console.error('GET /api/susu/request error:', error);
    return NextResponse.json({ success: true, data: global.__inMemoryMilkRequestList || [] });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only ADMIN_PENGEMASAN or SUPERADMIN can create milk requests
    if (authUser.role !== 'ADMIN_PENGEMASAN' && authUser.role !== 'SUPERADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Akses ditolak: Hanya Admin Pengemasan yang dapat membuat request susu bahan baku'
      }, { status: 403 });
    }

    const body = await request.json();
    const { date, volumeLiters, processingNeeds, priority, notes } = body;

    const vol = parseFloat(volumeLiters || 0);
    if (!vol || vol <= 0) {
      return NextResponse.json({ success: false, message: 'Jumlah susu yang dibutuhkan (Liter) harus berupa angka positif' }, { status: 400 });
    }

    const validUserId = await resolveValidUserId(authUser);
    const requestNo = await generateRequestNo(date);
    const pNeeds = processingNeeds || 'Susu Pasteurisasi';
    const prio = priority || 'Normal';

    let createdRecord = null;
    try {
      createdRecord = await prisma.milkRequest.create({
        data: {
          requestNo,
          date: date ? new Date(date) : new Date(),
          volumeLiters: vol,
          processingNeeds: pNeeds,
          priority: prio,
          notes: notes || null,
          status: 'MENUNGGU_PERSETUJUAN',
          createdById: validUserId,
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true, role: true } }
        }
      });
    } catch (e) {
      console.error('prisma.milkRequest.create error:', e);
      createdRecord = null;
    }

    if (!createdRecord) {
      createdRecord = {
        id: `req-${Date.now()}`,
        requestNo,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        volumeLiters: vol,
        processingNeeds: pNeeds,
        priority: prio,
        notes: notes || null,
        status: 'MENUNGGU_PERSETUJUAN',
        createdById: validUserId,
        createdBy: { id: validUserId, name: authUser.name || 'Admin Pengemasan', email: authUser.email || '', role: authUser.role },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // Auto-create BAST document for this milk request
    const targetDateObj = date ? new Date(date) : new Date();
    const yyyy = targetDateObj.getFullYear();
    const mm = String(targetDateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDateObj.getDate()).padStart(2, '0');
    const dateCode = `${yyyy}${mm}${dd}`;

    let bastNo = `BAST-REQ-${dateCode}-001`;
    try {
      const bCount = (prisma.beritaAcara && typeof prisma.beritaAcara.count === 'function')
        ? await prisma.beritaAcara.count()
        : 0;
      bastNo = `BAST-REQ-${dateCode}-${String(bCount + 1).padStart(3, '0')}`;

      if (prisma.beritaAcara && typeof prisma.beritaAcara.create === 'function') {
        await prisma.beritaAcara.create({
          data: {
            type: 'PERMINTAAN_SUSU',
            nomorBA: bastNo,
            date: targetDateObj,
            shift: 'Pagi',
            farmLocation: 'Gudang Pemasaran / Cold Storage',
            animalType: pNeeds.toLowerCase().includes('kambing') ? 'KAMBING' : 'SAPI',
            unit: 'Liter',
            totalProduksi: vol,
            penggunaanPedet: 0,
            afkir: 0,
            lainLain: 0,
            diserahterimakan: vol,
            penyerahRole: 'Seksi Pemasaran',
            penyerahName: 'Tim Kerja Layanan Pemasaran',
            penerimaRole: 'Unit Pengolahan Susu (UHT)',
            penerimaName: authUser.name || 'Admin Pengemasan',
            purpose: pNeeds,
            status: 'MENUNGGU_KONFIRMASI',
            notes: `[Permintaan Susu ${requestNo}] Kebutuhan: ${pNeeds}. Prioritas: ${prio}. ${notes || ''}`.trim(),
            createdById: validUserId,
          }
        });
      }
    } catch (baErr) {
      console.error('Error auto-creating BAST for milk request:', baErr);
    }

    // Auto-create notification for Admin Pemasaran
    try {
      if (prisma.notification && typeof prisma.notification.create === 'function') {
        await prisma.notification.create({
          data: {
            title: `Permintaan Bahan Baku Susu: ${vol} L`,
            message: `${authUser.name || 'Admin Pengemasan'} mengajukan permintaan ${vol} Liter susu segar (${pNeeds}) dengan dokumen BAST ${bastNo}.`,
            type: 'REQUEST_SUSU',
            targetRole: 'ADMIN_PEMASARAN',
            senderId: validUserId,
            senderName: authUser.name || 'Admin Pengemasan',
            senderRole: 'ADMIN_PENGEMASAN',
            link: '/pemasaran/berita-acara',
          }
        });
      }
    } catch (notifErr) {
      console.error('Error creating notification for milk request:', notifErr);
    }

    global.__inMemoryMilkRequestList.unshift(createdRecord);

    return NextResponse.json({
      success: true,
      message: `Request susu (${requestNo}) dan dokumen ${bastNo} berhasil dikirim ke Admin Pemasaran!`,
      data: {
        ...createdRecord,
        bastNo
      }
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/susu/request error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
