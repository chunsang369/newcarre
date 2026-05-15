const fs = require('fs');
const content = fs.readFileSync('prisma/car-data.ts', 'utf-8');
const cars = ['hyundai-ioniq5', 'hyundai-ioniq6', 'kia-ev6', 'kia-ev3'];
cars.forEach(slug => {
  const startIndex = content.indexOf('"slug": "' + slug + '"');
  if (startIndex === -1) return;
  const matrixIndex = content.indexOf('priceMatrix', startIndex);
  if (matrixIndex === -1) return;
  const endIndex = content.indexOf('    }', matrixIndex);
  console.log('---', slug, '---');
  console.log(content.substring(matrixIndex, endIndex + 5));
});
