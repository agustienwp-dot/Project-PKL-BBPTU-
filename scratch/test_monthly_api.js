const jwt = require('jsonwebtoken');
const JWT_SECRET = 'jwt-secret-key';
const token = jwt.sign({ id: 'test-user', name: 'wiwit', email: 'wiwit123@gmail.com', role: 'ADMIN_FARM' }, JWT_SECRET, { expiresIn: '1d' });

async function testMonthlyApi() {
  console.log('--- TEST 1: SAPI ---');
  const res1 = await fetch('http://localhost:3000/api/reports/monthly?month=9&year=2026&productType=SEGAR&animalType=SAPI', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const j1 = await res1.json();
  console.log('SAPI Summary:', j1.data?.summary?.farmsMonthlyTotal);

  console.log('--- TEST 2: KAMBING ---');
  const res2 = await fetch('http://localhost:3000/api/reports/monthly?month=9&year=2026&productType=SEGAR&animalType=KAMBING', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const j2 = await res2.json();
  console.log('KAMBING Summary:', j2.data?.summary?.farmsMonthlyTotal);

  console.log('--- TEST 3: ALL ---');
  const res3 = await fetch('http://localhost:3000/api/reports/monthly?month=9&year=2026&productType=SEGAR&animalType=ALL', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const j3 = await res3.json();
  console.log('ALL Summary:', j3.data?.summary?.farmsMonthlyTotal);
  console.log('ALL Day 10 Breakdown:', JSON.stringify(j3.data?.dailyLogs?.find(d => d.day === 10)?.farmsBreakdown, null, 2));
}

testMonthlyApi();
