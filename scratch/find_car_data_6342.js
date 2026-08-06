const fs = require('fs');

const data = fs.readFileSync('prisma/car-data.ts', 'utf8');

// tesla-model-y-juniper-6342 검색
const idx = data.indexOf('tesla-model-y-juniper-6342');
if (idx !== -1) {
  console.log('Found slug! Showing surrounding context:');
  console.log(data.substring(idx - 100, idx + 1000));
} else {
  console.log('Slug tesla-model-y-juniper-6342 not found.');
}
