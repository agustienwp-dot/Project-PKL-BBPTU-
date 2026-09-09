const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixKambingAndSeq() {
  const allBa = await prisma.beritaAcara.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log('Total BASTs in DB:', allBa.length);

  for (const ba of allBa) {
    const isKambing = (ba.animalType || '').toUpperCase() === 'KAMBING';
    const oldNum = ba.nomorBA;

    if (isKambing && oldNum && (oldNum.includes('-MG-') || oldNum.includes('-TS-') || oldNum.includes('-LK-') || oldNum.includes('-EW-'))) {
      const newNum = oldNum.replace(/-[A-Z]{2}-/, '-');
      console.log(`Fixing Kambing BAST ${ba.id}: ${oldNum} -> ${newNum}`);
      await prisma.beritaAcara.update({
        where: { id: ba.id },
        data: { nomorBA: newNum },
      }).catch(e => console.error('Error updating BAST number:', e.message));
    }
  }

  // Also fix duplicate sequence numbers on 20260907 if any exist
  const bastsToday = await prisma.beritaAcara.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const seenNums = new Set();
  let maxSeqSept = 1;

  for (const ba of bastsToday) {
    let num = ba.nomorBA;
    if (seenNums.has(num)) {
      maxSeqSept++;
      const seqStr = maxSeqSept.toString().padStart(3, '0');
      const fixedNum = num.replace(/-\d+$/, `-${seqStr}`);
      console.log(`Fixing duplicate ${num} -> ${fixedNum}`);
      await prisma.beritaAcara.update({
        where: { id: ba.id },
        data: { nomorBA: fixedNum },
      }).catch(e => console.error('Error fixing duplicate:', e.message));
      seenNums.add(fixedNum);
    } else {
      seenNums.add(num);
      const match = num.match(/-(\d+)$/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxSeqSept) maxSeqSept = val;
      }
    }
  }

  console.log('Database fix complete!');
}

fixKambingAndSeq().catch(console.error).finally(() => prisma.$disconnect());
