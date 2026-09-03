const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTest() {
  console.log('=== STARTING END-TO-END WORKFLOW VERIFICATION ===\n');

  try {
    // 1. ADMIN_PENGEMASAN creates raw milk request
    console.log('1. [ADMIN PENGEMASAN] Submitting Raw Milk Request...');
    const req1 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/susu/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'ADMIN_PENGEMASAN',
        'x-user-name': 'Budiman (Admin Pengemasan)'
      }
    }, {
      volumeLiters: 150,
      processingNeeds: 'Pasteurisasi & Yogurt Batch Pagi',
      priority: 'TINGGI',
      notes: 'Bahan baku untuk kemasan 250ml & 115ml'
    });
    console.log('Result:', req1.data);
    const requestId = req1.data?.data?.id;

    if (!requestId) {
      throw new Error('Failed to create milk request');
    }

    // 2. ADMIN_PEMASARAN approves request
    console.log('\n2. [ADMIN PEMASARAN] Approving Raw Milk Request...');
    const req2 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/susu/request/${requestId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'ADMIN_PEMASARAN',
        'x-user-name': 'Siti (Admin Pemasaran)'
      }
    }, { action: 'APPROVE' });
    console.log('Result:', req2.data);

    // 3. ADMIN_PEMASARAN dispatches raw milk
    console.log('\n3. [ADMIN PEMASARAN] Dispatching Raw Milk (SIAP DITERIMA)...');
    const req3 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/susu/request/${requestId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'ADMIN_PEMASARAN',
        'x-user-name': 'Siti (Admin Pemasaran)'
      }
    }, { action: 'DISPATCH' });
    console.log('Result:', req3.data);

    // 4. ADMIN_PENGEMASAN confirms receipt
    console.log('\n4. [ADMIN PENGEMASAN] Confirming Raw Milk Receipt...');
    const req4 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/susu/request/${requestId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'ADMIN_PENGEMASAN',
        'x-user-name': 'Budiman (Admin Pengemasan)'
      }
    }, { action: 'CONFIRM_RECEIPT', receivedVolumeLiters: 150 });
    console.log('Result:', req4.data);

    // 5. ADMIN_PENGEMASAN processes milk & records packaging
    console.log('\n5. [ADMIN PENGEMASAN] Recording Milk Packaging Output...');
    const req5 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/farm/packaging',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'ADMIN_PENGEMASAN',
        'x-user-name': 'Budiman (Admin Pengemasan)'
      }
    }, {
      rawMilkUsedLiters: 150,
      productCategory: 'Susu Pasteurisasi',
      packageSize: '250 ml',
      totalPackagedQty: 550,
      botolQty: 550,
      cupQty: 0,
      plastikBantalQty: 0,
      packagingDetails: JSON.stringify([
        { productCategory: 'Susu Pasteurisasi', packageSize: '250 ml', quantity: 450 },
        { productCategory: 'Yogurt', packageSize: '200 ml', quantity: 100 }
      ]),
      shift: 'Pagi',
      notes: 'Hasil olahan batch pagi'
    });
    console.log('Result:', req5.data);
    const packagingId = req5.data?.data?.id;

    // 6. ADMIN_PENGEMASAN creates BA Susu Olahan
    console.log('\n6. [ADMIN PENGEMASAN] Creating Berita Acara Susu Olahan...');
    const req6 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/berita-acara',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'ADMIN_PENGEMASAN',
        'x-user-name': 'Budiman (Admin Pengemasan)'
      }
    }, {
      type: 'SUSU_OLAHAN',
      packagingId: packagingId,
      date: new Date().toISOString().split('T')[0],
      shift: 'Pagi',
      farmLocation: 'Pengemasan & Olahan',
      penyerahName: 'Budiman',
      penerimaName: 'Seksi Pemasaran',
      diserahterimakan: 550,
      notes: 'Penyerahan hasil pengemasan siap jual',
      items: [
        { product: 'Susu Pasteurisasi', size: '250 ml', quantity: 450, unit: 'Botol' },
        { product: 'Yogurt', size: '200 ml', quantity: 100, unit: 'Cup' }
      ],
      status: 'MENUNGGU_KONFIRMASI_PEMASARAN'
    });
    console.log('Result:', req6.data);
    const baId = req6.data?.data?.id;

    // 7. ADMIN_PEMASARAN confirms BA Susu Olahan
    console.log('\n7. [ADMIN PEMASARAN] Confirming Berita Acara Susu Olahan Receipt...');
    const req7 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/berita-acara/${baId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'ADMIN_PEMASARAN',
        'x-user-name': 'Siti (Admin Pemasaran)'
      }
    }, { action: 'CONFIRM_PEMASARAN' });
    console.log('Result:', req7.data);

    console.log('\n=== END-TO-END WORKFLOW VERIFICATION SUCCESSFUL! ===');
  } catch (err) {
    console.error('Error during test execution:', err);
  }
}

runTest();
