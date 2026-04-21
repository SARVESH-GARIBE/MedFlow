import fs from 'fs';
try {
  await import('./server.js');
} catch (e) {
  fs.writeFileSync('test-error.txt', e.stack || e.message, 'utf8');
}
