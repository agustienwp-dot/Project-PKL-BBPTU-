const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRoles() {
  console.log('Fixing roles for ADMIN_PENGEMASAN accounts in database...');

  // Update in users table
  const updatedUsers = await prisma.user.updateMany({
    where: {
      OR: [
        { email: 'pengemasan@susu.com' },
        { name: { contains: 'PENGEMASAN' } },
        { name: { contains: 'Pengemasan' } },
      ],
    },
    data: {
      role: 'ADMIN_PENGEMASAN',
    },
  });
  console.log(`Updated ${updatedUsers.count} records in users table.`);

  // Update in admin table if role column exists
  try {
    const updatedAdmins = await prisma.admin.updateMany({
      where: {
        OR: [
          { username: { contains: 'PENGEMASAN' } },
          { username: { contains: 'pengemasan' } },
        ],
      },
      data: {
        role: 'ADMIN_PENGEMASAN',
      },
    });
    console.log(`Updated ${updatedAdmins.count} records in admin table.`);
  } catch (e) {
    console.log('Admin table update info:', e.message);
  }

  console.log('Role sync completed!');
}

fixRoles()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
