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
      content = content.replace(/(['"`])\/(dashboard|produksi|berita-acara|reports)([^'"`]*)(['"`])/g, '$1/susu-farm/$2$3$4');
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
