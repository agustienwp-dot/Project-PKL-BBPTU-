const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resequenceAllBasts() {
  const allBa = await prisma.beritaAcara.findMany({
    orderBy: [
      { date: 'asc' },
      { createdAt: 'asc' }
    ]
  });

  console.log(`Found ${allBa.length} total BAST records in DB.`);

  // Group by year and month (e.g. "2026-08", "2026-09")
  const groups = {};
  allBa.forEach(ba => {
    const d = ba.date ? new Date(ba.date) : new Date(ba.createdAt);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const key = `${y}-${m}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(ba);
  });

  for (const [monthKey, items] of Object.entries(groups)) {
    console.log(`\nProcessing month ${monthKey}: ${items.length} items`);
    let seq = 1;

    for (const ba of items) {
      const d = ba.date ? new Date(ba.date) : new Date(ba.createdAt);
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const dateStr = `${y}${m}${day}`;
      const seqStr = seq.toString().padStart(3, '0');

      const isHibah = ba.type === 'HIBAH';
      const isPembelian = ba.type === 'PEMBELIAN';
      const isOlahan = ba.type === 'SUSU_OLAHAN';
      const isKambing = (ba.animalType || '').toUpperCase() === 'KAMBING';

      let farmCode = 'FS';
      const loc = (ba.farmLocation || ba.location || '').toUpperCase();
      if (loc.includes('TEGAL')) farmCode = 'TS';
      else if (loc.includes('LIMPA')) farmCode = 'LK';
      else if (loc.includes('MANGGALA')) farmCode = 'MG';
      else if (loc.includes('EDU')) farmCode = 'EW';

      let newNomorBa = '';
      if (isHibah) {
        newNomorBa = `BAST-HB-${dateStr}-${seqStr}`;
      } else if (isPembelian) {
        newNomorBa = `BAST-PB-${dateStr}-${seqStr}`;
      } else if (isOlahan) {
        newNomorBa = `BAST-OLAHAN-${dateStr}-${seqStr}`;
      } else if (isKambing) {
        newNomorBa = `BA-${dateStr}-${seqStr}`;
      } else {
        newNomorBa = `BA-${farmCode}-${dateStr}-${seqStr}`;
      }

      console.log(`[${seq}] ID: ${ba.id} | Old: ${ba.nomorBA} -> New: ${newNomorBa}`);

      await prisma.beritaAcara.update({
        where: { id: ba.id },
        data: { nomorBA: newNomorBa }
      }).catch(e => console.error(`Error updating ${ba.id}:`, e.message));

      seq++;
    }
  }

  console.log('\nResequencing complete!');
}

resequenceAllBasts().catch(console.error).finally(() => prisma.$disconnect());
