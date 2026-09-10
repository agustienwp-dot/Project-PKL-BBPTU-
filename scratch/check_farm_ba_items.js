const jwt = require('jsonwebtoken');
const JWT_SECRET = 'jwt-secret-key';
const token = jwt.sign({ id: 'test-user', name: 'Admin Pemasaran', email: 'pemasaran@bbptu.com', role: 'ADMIN_PEMASARAN' }, JWT_SECRET, { expiresIn: '1d' });

async function check() {
  const res = await fetch('http://localhost:3000/api/susu-farm/berita-acara', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  console.log('Farm BA items:', JSON.stringify(json.data, null, 2));
}

check();
