const prisma = require('D:/BBPTUHPT/Project-PKL-BBPTU-/lib/prisma').default;

async function testBastRoute() {
  try {
    const docs = await prisma.bastDocument.findMany({
      orderBy: { tanggal: 'asc' },
    });
    console.log('Docs:', docs.length);
  } catch (e) {
    console.error('Error in bastDocument.findMany:', e.message);
  }
}

testBastRoute().finally(() => process.exit(0));
