import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

let dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/projek_bbptu';

// If process.env still has the initial example password "password", sanitize it to empty password
if (dbUrl.includes('root:password@')) {
  dbUrl = dbUrl.replace('root:password@', 'root:@');
}

// Add 1-second connect_timeout so Prisma fails fast when DB server is down
if (!dbUrl.includes('connect_timeout=')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=1';
}

function createClient() {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: [],
  });

  // Ensure beritaAcara delegate is attached if missing from generated Prisma Client JS
  attachBeritaAcaraDelegate(client);

  return client;
}

let isTableCreated = false;

async function ensureBeritaAcaraTable(client) {
  if (isTableCreated) return;
  try {
    await client.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`berita_acara\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`nomorBA\` VARCHAR(191) NOT NULL,
        \`type\` VARCHAR(50) NOT NULL,
        \`date\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`period\` VARCHAR(50) NULL,
        \`location\` VARCHAR(100) NULL,
        \`giverName\` VARCHAR(255) NOT NULL DEFAULT 'Tim Kerja Layanan Pemasaran',
        \`giverTitle\` VARCHAR(255) NULL,
        \`giverDept\` VARCHAR(255) NULL DEFAULT 'Tim Kerja Layanan Pemasaran',
        \`receiverName\` VARCHAR(255) NOT NULL,
        \`receiverTitle\` VARCHAR(255) NULL,
        \`receiverDept\` VARCHAR(255) NULL,
        \`purpose\` VARCHAR(255) NULL,
        \`notes\` TEXT NULL,
        \`items\` TEXT NOT NULL,
        \`createdById\` VARCHAR(191) NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`berita_acara_nomorBA_key\`(\`nomorBA\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    isTableCreated = true;
  } catch (e) {
    console.error('ensureBeritaAcaraTable error:', e);
  }
}

function attachBeritaAcaraDelegate(client) {
  if (!client) return;
  if (client.beritaAcara && typeof client.beritaAcara.count === 'function') return;

  const escapeStr = (val) => (val === null || val === undefined ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`);

  client.beritaAcara = {
    count: async (args = {}) => {
      await ensureBeritaAcaraTable(client);
      try {
        const res = await client.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM \`berita_acara\``);
        const cnt = res && res[0] ? Number(res[0].cnt || res[0]['COUNT(*)'] || 0) : 0;
        return cnt;
      } catch (e) {
        return 0;
      }
    },

    findMany: async (args = {}) => {
      await ensureBeritaAcaraTable(client);
      let sql = `SELECT b.*, u.id as u_id, u.name as u_name, u.email as u_email, u.role as u_role FROM \`berita_acara\` b LEFT JOIN \`users\` u ON b.createdById = u.id`;
      const conditions = [];

      if (args.where?.type) {
        conditions.push(`b.type = '${args.where.type}'`);
      }
      if (args.where?.date) {
        if (args.where.date.gte && args.where.date.lte) {
          const gte = new Date(args.where.date.gte).toISOString().slice(0, 19).replace('T', ' ');
          const lte = new Date(args.where.date.lte).toISOString().slice(0, 19).replace('T', ' ');
          conditions.push(`b.date >= '${gte}' AND b.date <= '${lte}'`);
        }
      }
      if (args.where?.OR && Array.isArray(args.where.OR)) {
        const orClauses = args.where.OR.map((o) => {
          const keys = Object.keys(o);
          if (keys.length === 0) return null;
          const key = keys[0];
          const val = o[key]?.contains || '';
          return val ? `b.\`${key}\` LIKE '%${val}%'` : null;
        }).filter(Boolean);
        if (orClauses.length > 0) {
          conditions.push(`(${orClauses.join(' OR ')})`);
        }
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      sql += ` ORDER BY b.createdAt DESC`;

      const rows = await client.$queryRawUnsafe(sql);
      return (rows || []).map((r) => ({
        id: r.id,
        nomorBA: r.nomorBA,
        type: r.type,
        date: r.date,
        period: r.period,
        location: r.location,
        giverName: r.giverName,
        giverTitle: r.giverTitle,
        giverDept: r.giverDept,
        receiverName: r.receiverName,
        receiverTitle: r.receiverTitle,
        receiverDept: r.receiverDept,
        purpose: r.purpose,
        notes: r.notes,
        items: r.items,
        createdById: r.createdById,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        createdBy: r.u_id ? { id: r.u_id, name: r.u_name, email: r.u_email, role: r.u_role } : null,
      }));
    },

    findUnique: async (args = {}) => {
      await ensureBeritaAcaraTable(client);
      const id = args.where?.id;
      const nomorBA = args.where?.nomorBA;
      let sql = `SELECT b.*, u.id as u_id, u.name as u_name, u.email as u_email, u.role as u_role FROM \`berita_acara\` b LEFT JOIN \`users\` u ON b.createdById = u.id`;
      if (id) {
        sql += ` WHERE b.id = '${id}'`;
      } else if (nomorBA) {
        sql += ` WHERE b.nomorBA = '${nomorBA}'`;
      } else {
        return null;
      }

      const rows = await client.$queryRawUnsafe(sql);
      if (!rows || rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        nomorBA: r.nomorBA,
        type: r.type,
        date: r.date,
        period: r.period,
        location: r.location,
        giverName: r.giverName,
        giverTitle: r.giverTitle,
        giverDept: r.giverDept,
        receiverName: r.receiverName,
        receiverTitle: r.receiverTitle,
        receiverDept: r.receiverDept,
        purpose: r.purpose,
        notes: r.notes,
        items: r.items,
        createdById: r.createdById,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        createdBy: r.u_id ? { id: r.u_id, name: r.u_name, email: r.u_email, role: r.u_role } : null,
      };
    },

    create: async (args = {}) => {
      await ensureBeritaAcaraTable(client);
      const d = args.data || {};
      const id = d.id || `ba-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const nomorBA = d.nomorBA;
      const type = d.type;
      const date = d.date ? new Date(d.date).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ');
      const period = d.period || null;
      const location = d.location || null;
      const giverName = d.giverName || 'Tim Kerja Layanan Pemasaran';
      const giverTitle = d.giverTitle || null;
      const giverDept = d.giverDept || 'Tim Kerja Layanan Pemasaran';
      const receiverName = d.receiverName || '';
      const receiverTitle = d.receiverTitle || null;
      const receiverDept = d.receiverDept || null;
      const purpose = d.purpose || null;
      const notes = d.notes || null;
      const items = typeof d.items === 'string' ? d.items : JSON.stringify(d.items || []);
      const createdById = d.createdById || null;

      const sql = `INSERT INTO \`berita_acara\` 
        (\`id\`, \`nomorBA\`, \`type\`, \`date\`, \`period\`, \`location\`, \`giverName\`, \`giverTitle\`, \`giverDept\`, \`receiverName\`, \`receiverTitle\`, \`receiverDept\`, \`purpose\`, \`notes\`, \`items\`, \`createdById\`, \`createdAt\`, \`updatedAt\`)
        VALUES (${escapeStr(id)}, ${escapeStr(nomorBA)}, ${escapeStr(type)}, '${date}', ${escapeStr(period)}, ${escapeStr(location)}, ${escapeStr(giverName)}, ${escapeStr(giverTitle)}, ${escapeStr(giverDept)}, ${escapeStr(receiverName)}, ${escapeStr(receiverTitle)}, ${escapeStr(receiverDept)}, ${escapeStr(purpose)}, ${escapeStr(notes)}, ${escapeStr(items)}, ${escapeStr(createdById)}, NOW(3), NOW(3))`;

      await client.$executeRawUnsafe(sql);

      return await client.beritaAcara.findUnique({ where: { id } });
    },

    update: async (args = {}) => {
      await ensureBeritaAcaraTable(client);
      const id = args.where?.id;
      const d = args.data || {};

      const sets = [];
      if (d.type !== undefined) sets.push(`\`type\` = ${escapeStr(d.type)}`);
      if (d.date !== undefined) {
        const dateStr = new Date(d.date).toISOString().slice(0, 19).replace('T', ' ');
        sets.push(`\`date\` = '${dateStr}'`);
      }
      if (d.period !== undefined) sets.push(`\`period\` = ${escapeStr(d.period)}`);
      if (d.location !== undefined) sets.push(`\`location\` = ${escapeStr(d.location)}`);
      if (d.giverName !== undefined) sets.push(`\`giverName\` = ${escapeStr(d.giverName)}`);
      if (d.giverTitle !== undefined) sets.push(`\`giverTitle\` = ${escapeStr(d.giverTitle)}`);
      if (d.giverDept !== undefined) sets.push(`\`giverDept\` = ${escapeStr(d.giverDept)}`);
      if (d.receiverName !== undefined) sets.push(`\`receiverName\` = ${escapeStr(d.receiverName)}`);
      if (d.receiverTitle !== undefined) sets.push(`\`receiverTitle\` = ${escapeStr(d.receiverTitle)}`);
      if (d.receiverDept !== undefined) sets.push(`\`receiverDept\` = ${escapeStr(d.receiverDept)}`);
      if (d.purpose !== undefined) sets.push(`\`purpose\` = ${escapeStr(d.purpose)}`);
      if (d.notes !== undefined) sets.push(`\`notes\` = ${escapeStr(d.notes)}`);
      if (d.items !== undefined) {
        const itemsStr = typeof d.items === 'string' ? d.items : JSON.stringify(d.items || []);
        sets.push(`\`items\` = ${escapeStr(itemsStr)}`);
      }
      sets.push(`\`updatedAt\` = NOW(3)`);

      if (sets.length > 0 && id) {
        await client.$executeRawUnsafe(`UPDATE \`berita_acara\` SET ${sets.join(', ')} WHERE \`id\` = '${id}'`);
      }

      return await client.beritaAcara.findUnique({ where: { id } });
    },

    delete: async (args = {}) => {
      await ensureBeritaAcaraTable(client);
      const id = args.where?.id;
      if (id) {
        await client.$executeRawUnsafe(`DELETE FROM \`berita_acara\` WHERE \`id\` = '${id}'`);
      }
      return { id };
    },
  };
}

// Reset global cached client if it failed or was created with invalid URL
if (!globalForPrisma.prisma || globalForPrisma._prismaUrl !== dbUrl) {
  globalForPrisma.prisma = createClient();
  globalForPrisma._prismaUrl = dbUrl;
} else {
  attachBeritaAcaraDelegate(globalForPrisma.prisma);
}

export function isDbOffline() {
  if (global.__dbOfflineUntil && Date.now() < global.__dbOfflineUntil) {
    return true;
  }
  return false;
}

export function markDbOffline() {
  global.__dbOfflineUntil = Date.now() + 30000;
}

export function markDbOnline() {
  global.__dbOfflineUntil = 0;
}

export const prisma = globalForPrisma.prisma;

export default prisma;

