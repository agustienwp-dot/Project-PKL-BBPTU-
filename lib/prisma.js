import { PrismaClient } from './prisma-client';

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

// Flags to track raw SQL table creation status
let isBeritaAcaraTableCreated = false;
let isMilkRequestTableCreated = false;

function createClient() {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: [],
  });

  // Ensure fallback delegates are attached to the client instance
  attachDelegates(client);

  return client;
}

async function ensureBeritaAcaraTable(client) {
  if (isBeritaAcaraTableCreated) return;
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
    isBeritaAcaraTableCreated = true;
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

async function ensureMilkRequestTable(client) {
  if (isMilkRequestTableCreated) return;
  try {
    await client.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`milk_requests\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`requestNo\` VARCHAR(191) NOT NULL,
        \`date\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`volumeLiters\` DOUBLE NOT NULL DEFAULT 0,
        \`processingNeeds\` VARCHAR(255) NOT NULL,
        \`priority\` VARCHAR(50) NOT NULL DEFAULT 'Normal',
        \`notes\` TEXT NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'MENUNGGU_PERSETUJUAN',
        \`rejectionReason\` TEXT NULL,
        \`approvedAt\` DATETIME(3) NULL,
        \`approvedById\` VARCHAR(191) NULL,
        \`approvedByName\` VARCHAR(255) NULL,
        \`dispatchedAt\` DATETIME(3) NULL,
        \`readyForReceiptAt\` DATETIME(3) NULL,
        \`receivedVolumeLiters\` DOUBLE NULL,
        \`receivedAt\` DATETIME(3) NULL,
        \`receivedById\` VARCHAR(191) NULL,
        \`receivedByName\` VARCHAR(255) NULL,
        \`createdById\` VARCHAR(191) NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`milk_requests_requestNo_key\`(\`requestNo\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    isMilkRequestTableCreated = true;
  } catch (e) {
    console.error('ensureMilkRequestTable error:', e);
  }
}

function attachMilkRequestDelegate(client) {
  if (!client) return;
  if (client.milkRequest && typeof client.milkRequest.count === 'function') return;

  const escapeStr = (val) => (val === null || val === undefined ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`);

  client.milkRequest = {
    count: async (args = {}) => {
      await ensureMilkRequestTable(client);
      try {
        let sql = `SELECT COUNT(*) as cnt FROM \`milk_requests\``;
        if (args.where?.status) {
          sql += ` WHERE \`status\` = '${args.where.status}'`;
        }
        const res = await client.$queryRawUnsafe(sql);
        return res && res[0] ? Number(res[0].cnt || res[0]['COUNT(*)'] || 0) : 0;
      } catch (e) {
        return 0;
      }
    },
    findMany: async (args = {}) => {
      await ensureMilkRequestTable(client);
      let sql = `SELECT r.*, u.id as u_id, u.name as u_name, u.email as u_email, u.role as u_role FROM \`milk_requests\` r LEFT JOIN \`users\` u ON r.createdById = u.id`;
      const conditions = [];

      if (args.where?.status) {
        if (typeof args.where.status === 'string') {
          conditions.push(`r.status = '${args.where.status}'`);
        } else if (args.where.status.in && Array.isArray(args.where.status.in)) {
          const inVals = args.where.status.in.map(v => `'${v}'`).join(',');
          conditions.push(`r.status IN (${inVals})`);
        }
      }
      if (args.where?.createdById) {
        conditions.push(`r.createdById = '${args.where.createdById}'`);
      }
      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
      sql += ` ORDER BY r.createdAt DESC`;

      try {
        const rows = await client.$queryRawUnsafe(sql);
        return (rows || []).map(r => ({
          ...r,
          createdBy: r.u_id ? { id: r.u_id, name: r.u_name, email: r.u_email, role: r.u_role } : null
        }));
      } catch (e) {
        return [];
      }
    },
    findUnique: async (args = {}) => {
      await ensureMilkRequestTable(client);
      const id = args.where?.id;
      const requestNo = args.where?.requestNo;
      let sql = `SELECT r.*, u.id as u_id, u.name as u_name, u.email as u_email, u.role as u_role FROM \`milk_requests\` r LEFT JOIN \`users\` u ON r.createdById = u.id`;
      if (id) sql += ` WHERE r.id = '${id}'`;
      else if (requestNo) sql += ` WHERE r.requestNo = '${requestNo}'`;
      else return null;

      try {
        const rows = await client.$queryRawUnsafe(sql);
        if (!rows || rows.length === 0) return null;
        const r = rows[0];
        return {
          ...r,
          createdBy: r.u_id ? { id: r.u_id, name: r.u_name, email: r.u_email, role: r.u_role } : null
        };
      } catch (e) {
        return null;
      }
    },
    create: async (args = {}) => {
      await ensureMilkRequestTable(client);
      const d = args.data || {};
      const id = d.id || `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const requestNo = d.requestNo;
      const date = d.date ? new Date(d.date).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ');
      const volumeLiters = parseFloat(d.volumeLiters || 0);
      const processingNeeds = d.processingNeeds || 'Susu Pasteurisasi';
      const priority = d.priority || 'Normal';
      const notes = d.notes || null;
      const status = d.status || 'MENUNGGU_PERSETUJUAN';
      const createdById = d.createdById || null;

      const sql = `INSERT INTO \`milk_requests\`
        (\`id\`, \`requestNo\`, \`date\`, \`volumeLiters\`, \`processingNeeds\`, \`priority\`, \`notes\`, \`status\`, \`createdById\`, \`createdAt\`, \`updatedAt\`)
        VALUES (${escapeStr(id)}, ${escapeStr(requestNo)}, '${date}', ${volumeLiters}, ${escapeStr(processingNeeds)}, ${escapeStr(priority)}, ${escapeStr(notes)}, ${escapeStr(status)}, ${escapeStr(createdById)}, NOW(3), NOW(3))`;

      await client.$executeRawUnsafe(sql);
      return await client.milkRequest.findUnique({ where: { id } });
    },
    update: async (args = {}) => {
      await ensureMilkRequestTable(client);
      const id = args.where?.id;
      const d = args.data || {};
      const sets = [];

      if (d.status !== undefined) sets.push(`\`status\` = ${escapeStr(d.status)}`);
      if (d.rejectionReason !== undefined) sets.push(`\`rejectionReason\` = ${escapeStr(d.rejectionReason)}`);
      if (d.approvedAt !== undefined) {
        sets.push(`\`approvedAt\` = ${d.approvedAt ? `'${new Date(d.approvedAt).toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL'}`);
      }
      if (d.approvedById !== undefined) sets.push(`\`approvedById\` = ${escapeStr(d.approvedById)}`);
      if (d.approvedByName !== undefined) sets.push(`\`approvedByName\` = ${escapeStr(d.approvedByName)}`);
      if (d.readyForReceiptAt !== undefined) {
        sets.push(`\`readyForReceiptAt\` = ${d.readyForReceiptAt ? `'${new Date(d.readyForReceiptAt).toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL'}`);
      }
      if (d.receivedVolumeLiters !== undefined) sets.push(`\`receivedVolumeLiters\` = ${d.receivedVolumeLiters === null ? 'NULL' : parseFloat(d.receivedVolumeLiters)}`);
      if (d.receivedAt !== undefined) {
        sets.push(`\`receivedAt\` = ${d.receivedAt ? `'${new Date(d.receivedAt).toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL'}`);
      }
      if (d.receivedById !== undefined) sets.push(`\`receivedById\` = ${escapeStr(d.receivedById)}`);
      if (d.receivedByName !== undefined) sets.push(`\`receivedByName\` = ${escapeStr(d.receivedByName)}`);
      sets.push(`\`updatedAt\` = NOW(3)`);

      if (sets.length > 0 && id) {
        await client.$executeRawUnsafe(`UPDATE \`milk_requests\` SET ${sets.join(', ')} WHERE \`id\` = '${id}'`);
      }
      return await client.milkRequest.findUnique({ where: { id } });
    }
  };
}

let isPackagingMaterialTableCreated = false;
let isMaterialStockMovementTableCreated = false;

const INITIAL_MATERIALS = [
  { code: 'MAT-BOT-115', name: 'Botol 115 ml', category: 'Kemasan', unit: 'pcs', currentStock: 2500, minimumStock: 500, criticalStock: 200 },
  { code: 'MAT-BOT-250', name: 'Botol 250 ml', category: 'Kemasan', unit: 'pcs', currentStock: 1850, minimumStock: 500, criticalStock: 200 },
  { code: 'MAT-CUP-200', name: 'Cup 200 ml', category: 'Kemasan', unit: 'pcs', currentStock: 1200, minimumStock: 300, criticalStock: 100 },
  { code: 'MAT-PLASTIK', name: 'Plastik Bantal', category: 'Kemasan', unit: 'pcs', currentStock: 800, minimumStock: 200, criticalStock: 50 },
  { code: 'MAT-TUTUP-BOTOL', name: 'Tutup Botol', category: 'Tutup', unit: 'pcs', currentStock: 4000, minimumStock: 1000, criticalStock: 400 },
  { code: 'MAT-TUTUP-CUP', name: 'Tutup Cup', category: 'Tutup', unit: 'pcs', currentStock: 2000, minimumStock: 500, criticalStock: 200 },
  { code: 'MAT-LBL-115', name: 'Label Susu 115 ml', category: 'Label', unit: 'pcs', currentStock: 3000, minimumStock: 500, criticalStock: 200 },
  { code: 'MAT-LBL-250', name: 'Label Susu 250 ml', category: 'Label', unit: 'pcs', currentStock: 2500, minimumStock: 500, criticalStock: 200 },
  { code: 'MAT-LBL-YOGURT', name: 'Label Yogurt', category: 'Label', unit: 'pcs', currentStock: 1500, minimumStock: 300, criticalStock: 100 },
];

async function ensurePackagingMaterialTable(client) {
  if (isPackagingMaterialTableCreated) return;
  try {
    await client.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`packaging_materials\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`code\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`category\` VARCHAR(100) NOT NULL DEFAULT 'Kemasan',
        \`unit\` VARCHAR(50) NOT NULL DEFAULT 'pcs',
        \`currentStock\` DOUBLE NOT NULL DEFAULT 0,
        \`minimumStock\` DOUBLE NOT NULL DEFAULT 500,
        \`criticalStock\` DOUBLE NOT NULL DEFAULT 200,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`packaging_materials_code_key\`(\`code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed default materials if table is empty
    const countRes = await client.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM \`packaging_materials\``).catch(() => []);
    const cnt = countRes && countRes[0] ? Number(countRes[0].cnt || countRes[0]['COUNT(*)'] || 0) : 0;
    
    if (cnt === 0) {
      const escapeStr = (val) => (val === null || val === undefined ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`);
      for (const item of INITIAL_MATERIALS) {
        const id = `mat-${item.code.toLowerCase()}`;
        await client.$executeRawUnsafe(`
          INSERT INTO \`packaging_materials\` 
          (\`id\`, \`code\`, \`name\`, \`category\`, \`unit\`, \`currentStock\`, \`minimumStock\`, \`criticalStock\`, \`createdAt\`, \`updatedAt\`)
          VALUES (${escapeStr(id)}, ${escapeStr(item.code)}, ${escapeStr(item.name)}, ${escapeStr(item.category)}, ${escapeStr(item.unit)}, ${item.currentStock}, ${item.minimumStock}, ${item.criticalStock}, NOW(3), NOW(3))
          ON DUPLICATE KEY UPDATE \`name\`=\`name\`;
        `).catch(() => {});
      }
    }

    isPackagingMaterialTableCreated = true;
  } catch (e) {
    console.error('ensurePackagingMaterialTable error:', e);
  }
}

async function ensureMaterialStockMovementTable(client) {
  if (isMaterialStockMovementTableCreated) return;
  try {
    await client.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`material_stock_movements\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`materialId\` VARCHAR(191) NOT NULL,
        \`type\` VARCHAR(50) NOT NULL,
        \`quantity\` DOUBLE NOT NULL DEFAULT 0,
        \`previousStock\` DOUBLE NOT NULL DEFAULT 0,
        \`newStock\` DOUBLE NOT NULL DEFAULT 0,
        \`source\` VARCHAR(50) NOT NULL DEFAULT 'PENYESUAIAN',
        \`referenceId\` VARCHAR(191) NULL,
        \`notes\` TEXT NULL,
        \`createdById\` VARCHAR(191) NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        KEY \`material_stock_movements_materialId_fkey\` (\`materialId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    isMaterialStockMovementTableCreated = true;
  } catch (e) {
    console.error('ensureMaterialStockMovementTable error:', e);
  }
}

function attachPackagingMaterialDelegate(client) {
  if (!client) return;
  if (client.packagingMaterial && typeof client.packagingMaterial.count === 'function') return;

  const escapeStr = (val) => (val === null || val === undefined ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`);

  client.packagingMaterial = {
    count: async (args = {}) => {
      await ensurePackagingMaterialTable(client);
      try {
        const res = await client.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM \`packaging_materials\``);
        return res && res[0] ? Number(res[0].cnt || res[0]['COUNT(*)'] || 0) : 0;
      } catch (e) {
        return 0;
      }
    },
    findMany: async (args = {}) => {
      await ensurePackagingMaterialTable(client);
      let sql = `SELECT * FROM \`packaging_materials\``;
      if (args.where?.category) {
        sql += ` WHERE \`category\` = ${escapeStr(args.where.category)}`;
      }
      sql += ` ORDER BY \`category\` ASC, \`name\` ASC`;
      try {
        const rows = await client.$queryRawUnsafe(sql);
        return rows || [];
      } catch (e) {
        return [];
      }
    },
    findUnique: async (args = {}) => {
      await ensurePackagingMaterialTable(client);
      const id = args.where?.id;
      const code = args.where?.code;
      let sql = `SELECT * FROM \`packaging_materials\``;
      if (id) sql += ` WHERE \`id\` = ${escapeStr(id)}`;
      else if (code) sql += ` WHERE \`code\` = ${escapeStr(code)}`;
      else return null;

      try {
        const rows = await client.$queryRawUnsafe(sql);
        return rows && rows[0] ? rows[0] : null;
      } catch (e) {
        return null;
      }
    },
    update: async (args = {}) => {
      await ensurePackagingMaterialTable(client);
      const id = args.where?.id;
      const d = args.data || {};
      const sets = [];

      if (d.currentStock !== undefined) sets.push(`\`currentStock\` = ${parseFloat(d.currentStock)}`);
      if (d.minimumStock !== undefined) sets.push(`\`minimumStock\` = ${parseFloat(d.minimumStock)}`);
      if (d.criticalStock !== undefined) sets.push(`\`criticalStock\` = ${parseFloat(d.criticalStock)}`);
      if (d.name !== undefined) sets.push(`\`name\` = ${escapeStr(d.name)}`);
      sets.push(`\`updatedAt\` = NOW(3)`);

      if (sets.length > 0 && id) {
        await client.$executeRawUnsafe(`UPDATE \`packaging_materials\` SET ${sets.join(', ')} WHERE \`id\` = ${escapeStr(id)}`);
      }
      return await client.packagingMaterial.findUnique({ where: { id } });
    }
  };
}

function attachMaterialStockMovementDelegate(client) {
  if (!client) return;
  if (client.materialStockMovement && typeof client.materialStockMovement.count === 'function') return;

  const escapeStr = (val) => (val === null || val === undefined ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`);

  client.materialStockMovement = {
    count: async (args = {}) => {
      await ensureMaterialStockMovementTable(client);
      try {
        const res = await client.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM \`material_stock_movements\``);
        return res && res[0] ? Number(res[0].cnt || res[0]['COUNT(*)'] || 0) : 0;
      } catch (e) {
        return 0;
      }
    },
    findMany: async (args = {}) => {
      await ensureMaterialStockMovementTable(client);
      let sql = `SELECT m.*, p.name as materialName, p.code as materialCode, p.unit as materialUnit, u.name as actorName FROM \`material_stock_movements\` m LEFT JOIN \`packaging_materials\` p ON m.materialId = p.id LEFT JOIN \`users\` u ON m.createdById = u.id`;
      const conditions = [];

      if (args.where?.materialId) {
        conditions.push(`m.materialId = ${escapeStr(args.where.materialId)}`);
      }
      if (args.where?.source) {
        conditions.push(`m.source = ${escapeStr(args.where.source)}`);
      }
      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
      sql += ` ORDER BY m.createdAt DESC`;

      if (args.take) {
        sql += ` LIMIT ${parseInt(args.take, 10)}`;
      }

      try {
        const rows = await client.$queryRawUnsafe(sql);
        return (rows || []).map(r => ({
          ...r,
          material: { name: r.materialName, code: r.materialCode, unit: r.materialUnit },
          createdBy: r.actorName ? { name: r.actorName } : null
        }));
      } catch (e) {
        return [];
      }
    },
    create: async (args = {}) => {
      await ensureMaterialStockMovementTable(client);
      const d = args.data || {};
      const id = d.id || `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const materialId = d.materialId;
      const type = d.type || 'ADJUSTMENT';
      const quantity = parseFloat(d.quantity || 0);
      const previousStock = parseFloat(d.previousStock || 0);
      const newStock = parseFloat(d.newStock || 0);
      const source = d.source || 'PENYESUAIAN';
      const referenceId = d.referenceId || null;
      const notes = d.notes || null;
      const createdById = d.createdById || null;

      const sql = `INSERT INTO \`material_stock_movements\`
        (\`id\`, \`materialId\`, \`type\`, \`quantity\`, \`previousStock\`, \`newStock\`, \`source\`, \`referenceId\`, \`notes\`, \`createdById\`, \`createdAt\`)
        VALUES (${escapeStr(id)}, ${escapeStr(materialId)}, ${escapeStr(type)}, ${quantity}, ${previousStock}, ${newStock}, ${escapeStr(source)}, ${escapeStr(referenceId)}, ${escapeStr(notes)}, ${escapeStr(createdById)}, NOW(3))`;

      await client.$executeRawUnsafe(sql);
      return { id, materialId, type, quantity, previousStock, newStock, source, referenceId, notes, createdById };
    }
  };
}

// Helper to attach all dynamic delegates to a client instance
function attachDelegates(client) {
  if (!client) return;
  attachBeritaAcaraDelegate(client);
  attachMilkRequestDelegate(client);
  attachPackagingMaterialDelegate(client);
  attachMaterialStockMovementDelegate(client);
  return client;
}

// Reset global cached client if it failed or was created with invalid URL
if (!globalForPrisma.prisma || globalForPrisma._prismaUrl !== dbUrl) {
  globalForPrisma.prisma = createClient();
  globalForPrisma._prismaUrl = dbUrl;
} else {
  attachDelegates(globalForPrisma.prisma);
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
