const jwt = require('jsonwebtoken');
const JWT_SECRET = 'jwt-secret-key';
const token = jwt.sign({ id: 'test-user', name: 'Edwin', email: 'edwin12@gmail.com', role: 'ADMIN_PEMASARAN' }, JWT_SECRET, { expiresIn: '1d' });

async function verifyAll() {
  console.log('=== 1. TEST GET /api/bast (Dokumen Terbit) ===');
  const r1 = await fetch('http://localhost:3000/api/bast', { headers: { Authorization: `Bearer ${token}` } });
  const d1 = await r1.json();
  console.log('Dokumen Terbit count:', d1.data?.length, 'Status:', r1.status);
  if (d1.data?.length > 0) {
    console.log('Sample Terbit:', { nomor: d1.data[0].nomorBA, jenis: d1.data[0].type, vol: d1.data[0].volumeLiters, penerima: d1.data[0].penerimaNama });
  }

  console.log('=== 2. TEST GET /api/susu-farm/berita-acara (Dokumen Masuk) ===');
  const r2 = await fetch('http://localhost:3000/api/susu-farm/berita-acara', { headers: { Authorization: `Bearer ${token}` } });
  const d2 = await r2.json();
  console.log('Total BA from API:', d2.data?.length, 'Status:', r2.status);
  const incoming = (d2.data || []).filter(d => {
    const no = d.nomorBa || d.nomor_ba || d.nomorBA || '';
    return !no.includes('BAST-HB');
  });
  console.log('Incoming Farm BA count:', incoming.length);
  if (incoming.length > 0) {
    console.log('Sample Masuk:', { nomor: incoming[0].nomorBa, farm: incoming[0].farmLocation, vol: incoming[0].diserahterimakan, status: incoming[0].status });
  }

  console.log('=== 3. TEST SSR OF /pemasaran/berita-acara ===');
  const r3 = await fetch('http://localhost:3000/pemasaran/berita-acara');
  const text = await r3.text();
  console.log('HTML length:', text.length, 'Contains "Dokumen Terbit":', text.includes('Dokumen Terbit'), 'Contains "Dokumen Masuk":', text.includes('Dokumen Masuk'));
}

verifyAll();
