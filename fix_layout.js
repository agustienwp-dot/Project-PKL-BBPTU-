const fs = require('fs');
let content = fs.readFileSync('app/(dashboard)/layout.jsx', 'utf8');

// Fix SUPERADMIN conflict
content = content.replace(/<<<<<<< HEAD\s*\{\s*label:\s*'Dashboard Main',\s*path:\s*'\/uht\/dashboard',\s*icon:\s*LayoutDashboard\s*\},[\s\S]*?=======\s*\{\s*label:\s*'Dashboard Main',\s*path:\s*'\/susu-farm\/dashboard',\s*icon:\s*LayoutDashboard\s*\},[\s\S]*?>>>>>>> main/g, 
`        { label: 'Dashboard UHT', path: '/uht/dashboard', icon: LayoutDashboard },
        { label: 'Dashboard Farm', path: '/susu-farm/dashboard', icon: LayoutDashboard },
        { label: 'Manajemen System', path: '/superadmin', icon: ShieldCheck },
        { label: 'Request Susu Masuk', path: '/pemasaran/request-susu', icon: Truck, badge: pendingRequestCount > 0 ? \`\${pendingRequestCount}\` : null },
        { label: 'Berita Acara UHT', path: '/uht/berita-acara', icon: ClipboardList },
        { label: 'Berita Acara Farm', path: '/susu-farm/berita-acara', icon: ClipboardList },`);

// Fix ADMIN_FARM conflict
content = content.replace(/<<<<<<< HEAD\s*\{\s*label:\s*'Dashboard',\s*path:\s*'\/uht\/dashboard',[\s\S]*?=======\s*\{\s*label:\s*'Dashboard',\s*path:\s*'\/susu-farm\/dashboard',[\s\S]*?>>>>>>> main/g, 
`        { label: 'Dashboard', path: '/susu-farm/dashboard', icon: LayoutDashboard },
        { label: 'Produksi Susu', path: '/susu-farm/produksi', icon: Milk },
        { label: 'Berita Acara', path: '/susu-farm/berita-acara', icon: ClipboardList },
        { label: 'Laporan', path: '/susu-farm/reports', icon: FileText },`);

// Fix ADMIN_PEMASARAN conflict
content = content.replace(/<<<<<<< HEAD\s*\{\s*label:\s*'Dashboard',\s*path:\s*'\/uht\/dashboard',\s*icon:\s*LayoutDashboard\s*\},[\s\S]*?=======\s*\{\s*label:\s*'Dashboard',\s*path:\s*'\/susu-farm\/dashboard',\s*icon:\s*LayoutDashboard\s*\},[\s\S]*?>>>>>>> main/g, 
`        { label: 'Dashboard', path: '/susu-farm/dashboard', icon: LayoutDashboard },
        { label: 'Request Susu Masuk', path: '/pemasaran/request-susu', icon: Truck, badge: pendingRequestCount > 0 ? \`\${pendingRequestCount}\` : null },
        { label: 'Terima Hasil Olahan', path: '/pemasaran/penerimaan', icon: Bell, badge: pendingCount > 0 ? \`\${pendingCount}\` : null },
        { label: 'Berita Acara', path: '/susu-farm/berita-acara', icon: ClipboardList },`);

// Fix ADMIN_PENGEMASAN conflict
content = content.replace(/<<<<<<< HEAD\s*\{\s*label:\s*'Dashboard',\s*path:\s*'\/uht\/dashboard',\s*icon:\s*LayoutDashboard,\s*section:\s*'DASHBOARD'\s*\},[\s\S]*?=======\s*\{\s*label:\s*'Dashboard',\s*path:\s*'\/susu-farm\/dashboard',\s*icon:\s*LayoutDashboard,\s*section:\s*'DASHBOARD'\s*\},[\s\S]*?>>>>>>> main/g, 
`        { label: 'Dashboard', path: '/uht/dashboard', icon: LayoutDashboard, section: 'DASHBOARD' },
        { label: 'Request Susu', path: '/uht/request-susu', icon: Truck, section: 'PENGOLAHAN' },
        { label: 'Input Hasil Pengolahan', path: '/uht/pengemasan', icon: Package, section: 'PENGOLAHAN' },
        { label: 'Sisa Stok Bahan', path: '/uht/stok-bahan', icon: Boxes, section: 'PENGOLAHAN' },
        { label: 'Berita Acara Olahan', path: '/uht/berita-acara', icon: FileCheck, section: 'PENGOLAHAN' },
        { label: 'Laporan Pengolahan', path: '/uht/reports', icon: FileText, section: 'PENGOLAHAN' },`);

// Fix fallback conflict
content = content.replace(/<<<<<<< HEAD\s*\{\s*label:\s*'Dashboard',\s*path:\s*'\/uht\/dashboard',\s*icon:\s*LayoutDashboard\s*\},[\s\S]*?=======\s*\{\s*label:\s*'Dashboard',\s*path:\s*'\/susu-farm\/dashboard',\s*icon:\s*LayoutDashboard\s*\},[\s\S]*?>>>>>>> main/g, 
`      { label: 'Dashboard', path: '/susu-farm/dashboard', icon: LayoutDashboard },
      { label: 'Berita Acara', path: '/susu-farm/berita-acara', icon: ClipboardList },
      { label: 'Laporan', path: '/susu-farm/reports', icon: FileText },`);

fs.writeFileSync('app/(dashboard)/layout.jsx', content);
