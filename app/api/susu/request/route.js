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
    } catch (e) {
      console.error('prisma.milkRequest.findMany error:', e);
      items = [];
    }

    const dbIds = new Set(items.map((i) => i.id));
    const allItems = [...items];

    for (const memItem of (global.__inMemoryMilkRequestList || [])) {
      if (!dbIds.has(memItem.id)) {
        if (!status || status === 'ALL' || memItem.status === status) {
          allItems.push(memItem);
        }
      }
    }

    allItems.sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime());

    return NextResponse.json({ success: true, data: allItems });
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

    global.__inMemoryMilkRequestList.unshift(createdRecord);

    return NextResponse.json({
      success: true,
      message: `Request susu (${requestNo}) berhasil dikirim ke Admin Pemasaran!`,
      data: createdRecord
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/susu/request error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
