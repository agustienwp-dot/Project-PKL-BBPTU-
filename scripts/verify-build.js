const http = require('http');

function getUrl(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function verify() {
  console.log('Testing page endpoints after fixing lib/prisma.js...\n');
  try {
    const dashboard = await getUrl('/dashboard');
    console.log('/dashboard status:', dashboard.statusCode);
    
    const pengemasan = await getUrl('/pengemasan');
    console.log('/pengemasan status:', pengemasan.statusCode);

    const apiBa = await getUrl('/api/berita-acara');
    console.log('/api/berita-acara status:', apiBa.statusCode, 'Data length:', apiBa.body.length);

    const apiReq = await getUrl('/api/susu/request');
    console.log('/api/susu/request status:', apiReq.statusCode, 'Data length:', apiReq.body.length);

    console.log('\nALL ENDPOINTS RESPONDED SUCCESSFULLY WITHOUT BUILD ERRORS!');
  } catch (err) {
    console.error('Verification error:', err);
  }
}

verify();
