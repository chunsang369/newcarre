const fs = require('fs');
const data = fs.readFileSync('prisma/car-data.ts', 'utf8');

let pos = 0;
while (true) {
  const idx = data.indexOf('tesla-new-model-3', pos);
  if (idx === -1) break;
  console.log(`\nFound slug at position ${idx}:`);
  console.log(data.substring(idx - 100, idx + 1000));
  pos = idx + 1;
}
