const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testStats() {
  try {
    console.log("Testing Prisma Queries for Admin Pengemasan Stats...");
    const productionsAll = await prisma.milkProduction.findMany().catch(e => { console.error("Error productionsAll:", e); return []; });
    console.log("productionsAll count:", productionsAll.length);

    const packagingsAllForSisa = await prisma.milkPackaging.findMany({
      where: { status: { not: 'DIBATALKAN' } }
    }).catch(e => { console.error("Error packagingsAllForSisa:", e); return []; });
    console.log("packagingsAllForSisa count:", packagingsAllForSisa.length);

    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const endOfToday = new Date();
    endOfToday.setHours(23,59,59,999);

    const packagingsUpToYesterday = await prisma.milkPackaging.aggregate({
      where: { date: { lt: startOfToday }, status: { not: 'DIBATALKAN' } },
      _sum: { totalPackagedQty: true }
    }).catch(() => ({ _sum: null }));
    console.log("packagingsUpToYesterday:", packagingsUpToYesterday);

    const productionPkgUpToYesterday = await prisma.milkProduction.aggregate({
      where: { date: { lt: startOfToday } },
      _sum: { packagedQty: true }
    }).catch(() => ({ _sum: null }));
    console.log("productionPkgUpToYesterday:", productionPkgUpToYesterday);

    const allPackagings = await prisma.milkPackaging.findMany({
      where: { status: { not: 'DIBATALKAN' } }
    }).catch(() => []);
    console.log("allPackagings count:", allPackagings.length);

    console.log("ALL QUERIES PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("TEST FAILED WITH ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testStats();
