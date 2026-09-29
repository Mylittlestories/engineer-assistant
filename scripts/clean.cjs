const fs = require('fs');
const path = require('path');

for (const target of ['dist', 'release', 'server.cjs', 'server.cjs.map']) {
  fs.rmSync(path.resolve(__dirname, '..', target), { recursive: true, force: true });
}
console.log('Removed generated build artifacts.');
