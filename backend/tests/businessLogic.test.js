const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Business Logic & Transaction Integration Tests', () => {
  let adminToken = '';
  let testCageId = '';
  let fullCageId = '';
  let testBuyerId = '';
  let availableAnimalId = '';

  beforeAll(async () => {
    // 1. Reset & Seed DB for tests
    await prisma.auditLog.deleteMany();
    await prisma.animalMovement.deleteMany();
    await prisma.animalWeightHistory.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.animal.deleteMany();
    await prisma.buyer.deleteMany();
    await prisma.cage.deleteMany();
    await prisma.user.deleteMany();

    // Seed Admin User
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'testadmin@farm.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    // Obtain JWT Token via API
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testadmin@farm.com', password: 'admin123' });

    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.data.token;

    // Seed Cage 1 (Capacity 5)
    const cage1 = await prisma.cage.create({
      data: {
        name: 'Kandang Test Utama',
        type: 'Sapi',
        location: 'Blok Test',
        capacity: 5,
        isActive: true,
      },
    });
    testCageId = cage1.id;

    // Seed Cage 2 (Capacity 1 - Full Cage Test)
    const cage2 = await prisma.cage.create({
      data: {
        name: 'Kandang Penuh (Kapasitas 1)',
        type: 'Sapi',
        location: 'Blok Penuh',
        capacity: 1,
        isActive: true,
      },
    });
    fullCageId = cage2.id;

    // Seed Buyer
    const buyer = await prisma.buyer.create({
      data: {
        name: 'Pembeli Test',
        phone: '081299998888',
        address: 'Jl. Test No. 1',
      },
    });
    testBuyerId = buyer.id;

    // Seed 1 AVAILABLE Animal in testCageId
    const animal1 = await prisma.animal.create({
      data: {
        code: 'TEST-001',
        name: 'Si Jago',
        type: 'Sapi',
        breed: 'Limosin',
        gender: 'Jantan',
        weight: 400,
        purchasePrice: 10000000,
        status: 'AVAILABLE',
        cageId: testCageId,
      },
    });
    availableAnimalId = animal1.id;

    // Seed 1 AVAILABLE Animal in fullCageId (making fullCageId at max capacity 1/1)
    await prisma.animal.create({
      data: {
        code: 'FULL-001',
        name: 'Si Penghuni Penuh',
        type: 'Sapi',
        breed: 'Limosin',
        gender: 'Jantan',
        weight: 350,
        purchasePrice: 9000000,
        status: 'AVAILABLE',
        cageId: fullCageId,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // TEST 1: Hewan AVAILABLE dapat dijual
  test('TEST 1: Hewan dengan status AVAILABLE dapat dijual dengan sukses', async () => {
    const salePayload = {
      animalId: availableAnimalId,
      buyerId: testBuyerId,
      weightAtSale: 410,
      sellingPrice: 18000000,
      paymentMethod: 'CASH',
      notes: 'Penjualan tunai lunas',
    };

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(salePayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.animalId).toBe(availableAnimalId);

    // Verify animal status in DB updated to SOLD
    const updatedAnimal = await prisma.animal.findUnique({ where: { id: availableAnimalId } });
    expect(updatedAnimal.status).toBe('SOLD');
  });

  // TEST 2: Hewan SOLD tidak dapat dijual lagi
  test('TEST 2: Hewan dengan status SOLD tidak dapat dijual lagi (gagal)', async () => {
    const salePayload = {
      animalId: availableAnimalId, // animal status is now SOLD from Test 1
      buyerId: testBuyerId,
      weightAtSale: 410,
      sellingPrice: 19000000,
      paymentMethod: 'TRANSFER',
    };

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(salePayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/tidak dapat dijual/i);
  });

  // TEST 3 & TEST 4: Verifikasi perubahan agregasi stok AVAILABLE & SOLD
  test('TEST 3 & 4: Setelah penjualan, statistik stok AVAILABLE berkurang & SOLD bertambah', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAnimals).toBe(2);
    expect(res.body.data.availableAnimals).toBe(1); // FULL-001 is still AVAILABLE
    expect(res.body.data.soldAnimals).toBe(1); // TEST-001 is now SOLD
  });

  // TEST 5: Kapasitas kandang tidak boleh dilampaui
  test('TEST 5: Tidak dapat menambahkan hewan baru / memindahkan hewan jika kapasitas kandang penuh', async () => {
    // Attempt to add a new animal to fullCageId (capacity 1, currently holds 1 AVAILABLE animal)
    const newAnimalPayload = {
      code: 'OVERFLOW-001',
      name: 'Si Pilihan Melebihi Kapasitas',
      type: 'Sapi',
      breed: 'Limosin',
      gender: 'Jantan',
      weight: 300,
      purchasePrice: 8000000,
      cageId: fullCageId,
    };

    const resAdd = await request(app)
      .post('/api/animals')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newAnimalPayload);

    expect(resAdd.status).toBe(400);
    expect(resAdd.body.success).toBe(false);
    expect(resAdd.body.message).toMatch(/sudah penuh/i);

    // Attempt to move an available animal to fullCageId
    // First create a new available animal in testCageId
    const animalToMove = await prisma.animal.create({
      data: {
        code: 'MOVE-001',
        name: 'Si Calon Pindah',
        type: 'Sapi',
        breed: 'Simental',
        gender: 'Jantan',
        weight: 380,
        purchasePrice: 11000000,
        status: 'AVAILABLE',
        cageId: testCageId,
      },
    });

    const resMove = await request(app)
      .post(`/api/animals/${animalToMove.id}/move`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ toCageId: fullCageId, notes: 'Tes pindah ke kandang penuh' });

    expect(resMove.status).toBe(400);
    expect(resMove.body.success).toBe(false);
    expect(resMove.body.message).toMatch(/penuh/i);
  });

  // TEST 6: Jika transaksi penjualan gagal, status hewan tidak berubah (Transaction Rollback)
  test('TEST 6: Jika transaksi penjualan gagal (invalid buyer), status hewan tetap AVAILABLE', async () => {
    // Create an AVAILABLE animal
    const freshAnimal = await prisma.animal.create({
      data: {
        code: 'ROLLBACK-001',
        name: 'Si Uji Rollback',
        type: 'Sapi',
        breed: 'Limosin',
        gender: 'Betina',
        weight: 320,
        purchasePrice: 9500000,
        status: 'AVAILABLE',
        cageId: testCageId,
      },
    });

    // Attempt sale with non-existent buyerId
    const invalidSalePayload = {
      animalId: freshAnimal.id,
      buyerId: 'non-existent-buyer-uuid-999',
      weightAtSale: 320,
      sellingPrice: 15000000,
      paymentMethod: 'CASH',
    };

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidSalePayload);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);

    // Verify animal status in DB remains AVAILABLE
    const checkAnimal = await prisma.animal.findUnique({ where: { id: freshAnimal.id } });
    expect(checkAnimal.status).toBe('AVAILABLE');
  });
});
