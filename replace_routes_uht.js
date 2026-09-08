const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const originalContent = content;
      
      // /pengemasan/request-susu -> /uht/request-susu
      content = content.replace(/(['"`])\/pengemasan\/request-susu([^'"`]*)(['"`])/g, '$1/uht/request-susu$2$3');
      // /pengemasan/stok-bahan -> /uht/stok-bahan
      content = content.replace(/(['"`])\/pengemasan\/stok-bahan([^'"`]*)(['"`])/g, '$1/uht/stok-bahan$2$3');
      // /reports/pengolahan -> /uht/reports
      content = content.replace(/(['"`])\/reports\/pengolahan([^'"`]*)(['"`])/g, '$1/uht/reports$2$3');
      // /dashboard -> /uht/dashboard
      content = content.replace(/(['"`])\/dashboard([^'"`]*)(['"`])/g, '$1/uht/dashboard$2$3');
      // /berita-acara -> /uht/berita-acara
      content = content.replace(/(['"`])\/berita-acara([^'"`]*)(['"`])/g, '$1/uht/berita-acara$2$3');
      // /pengemasan -> /uht/pengemasan (must be done after /pengemasan/request-susu and /stok-bahan)
      content = content.replace(/(['"`])\/pengemasan([^'"`]*)(['"`])/g, '$1/uht/pengemasan$2$3');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

['app', 'components', 'lib'].forEach(dir => {
  if (fs.existsSync(dir)) {
    processDir(dir);
  }
});
