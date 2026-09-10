const { PrismaClient } = require('D:/BBPTUHPT/Project-PKL-BBPTU-/lib/prisma-client');
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe('SHOW TABLES');
  console.log('Tables:', tables);

  try {
    const bastCols = await prisma.$queryRawUnsafe('DESCRIBE bast_documents');
    console.log('bast_documents cols:', bastCols.map(c => c.Field));
  } catch (e) {
    console.log('bast_documents error:', e.message);
  }

  try {
    const baCols = await prisma.$queryRawUnsafe('DESCRIBE berita_acara');
    console.log('berita_acara cols:', baCols.map(c => c.Field));
  } catch (e) {
    console.log('berita_acara error:', e.message);
  }
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
  process.exit(0);
});
