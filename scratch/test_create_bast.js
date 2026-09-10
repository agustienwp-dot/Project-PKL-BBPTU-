const jwt = require('jsonwebtoken');
const JWT_SECRET = 'jwt-secret-key';
const token = jwt.sign({ id: 'test-user', name: 'Admin Pemasaran', email: 'pemasaran@bbptu.com', role: 'ADMIN_PEMASARAN' }, JWT_SECRET, { expiresIn: '1d' });

async function testCreateBast() {
  const res = await fetch('http://localhost:3000/api/bast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      tanggal: '2026-09-10',
      volumeLiters: 25,
      animalType: 'SAPI',
      jenisPermintaan: 'HIBAH',
      instansiPenerima: 'Yayasan Kasih Ibu',
      catatan: 'Penyaluran hibah susu sapi untuk panti asuhan'
    })
  });

  const json = await res.json();
  console.log('Create BAST response:', res.status, json);
}

testCreateBast();
