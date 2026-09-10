const fs = require('fs');
let code = fs.readFileSync('app/api/uht/dashboard/stats/route.js', 'utf8');

// 1. In getPackagingDailyChartData and getPackagingMonthlyChartData:
code = code.replace(
  /const prodPkgAgg = await prisma\.milkProduction\.aggregate\([\s\S]*?totalLiters = \(pkgAgg\?\._sum\?\.processedAmount \|\| 0\) \+ \(prodPkgAgg\?\._sum\?\.rawVolumeLiters \|\| 0\);/g,
  'const totalPcs = pkgAgg?._sum?.totalPackagedQty || 0;\n        const totalLiters = pkgAgg?._sum?.processedAmount || 0;'
);

// 2. In activityList:
const oldActivity = /rawProdList\.forEach\(\(pr\) => \{[\s\S]*?rawBaList\.forEach\(\(ba\) => \{[\s\S]*?\}\);\s*\}\);/;
const newActivity = `rawOutList.forEach((o) => {
      const isOlahan = (o.productType || '').toLowerCase() === 'olahan';
      if (isOlahan) {
        const isAfkir = (o.notes || '').toLowerCase().includes('afkir') || (o.notes || '').toLowerCase().includes('rusak');
        activityList.push({
          id: \`out-\${o.id}\`,
          type: isAfkir ? 'AFKIR' : 'HIBAH',
          title: isAfkir ? \`Produk Rusak / Afkir\` : \`Distribusi Hibah Olahan\`,
          detail: \`\${o.notes || \`\${o.quantity} pcs dikeluarkan\`}\`,
          status: 'Berhasil',
          timestamp: o.updatedAt || o.date,
          icon: isAfkir ? '⚠️' : '🎁',
          user: o.createdBy?.name || 'Admin Pengemasan',
          raw: o,
        });
      }
    });`;

code = code.replace(oldActivity, newActivity);

fs.writeFileSync('app/api/uht/dashboard/stats/route.js', code);
console.log('Successfully updated app/api/uht/dashboard/stats/route.js');
