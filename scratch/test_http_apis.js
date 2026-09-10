const jwt = require('jsonwebtoken');

const JWT_SECRET = 'jwt-secret-key';
const token = jwt.sign({ id: 'test-user', name: 'Admin Pemasaran', email: 'pemasaran@bbptu.com', role: 'ADMIN_PEMASARAN' }, JWT_SECRET, { expiresIn: '1d' });

async function testFetch() {
  console.log('--- Testing GET /api/bast ---');
  try {
    const res = await fetch('http://localhost:3000/api/bast', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    console.log('GET /api/bast status:', res.status, json);
  } catch (e) {
    console.log('GET /api/bast fetch error:', e.message);
  }

  console.log('--- Testing GET /api/susu-farm/berita-acara ---');
  try {
    const res = await fetch('http://localhost:3000/api/susu-farm/berita-acara', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    console.log('GET /api/susu-farm/berita-acara status:', res.status, 'Count:', json.data?.length);
  } catch (e) {
    console.log('GET /api/susu-farm/berita-acara fetch error:', e.message);
  }
}

testFetch();
