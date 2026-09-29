const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');
const noJekyllPath = path.join(distDir, '.nojekyll');

if (!fs.existsSync(indexPath)) {
  console.error('Cannot create GitHub Pages fallback: dist/index.html does not exist. Run vite build first.');
  process.exit(1);
}

fs.copyFileSync(indexPath, notFoundPath);
fs.writeFileSync(noJekyllPath, '');
console.log('Created dist/404.html and dist/.nojekyll for GitHub Pages.');
