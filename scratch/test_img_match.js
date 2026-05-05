const fs = require('fs');

const carMatrix = JSON.parse(fs.readFileSync('cars_final_full_matrix.json', 'utf8'));
const carDataText = fs.readFileSync('prisma/car-data.ts', 'utf8');
const popularCarsMatch = carDataText.match(/export const popularCars\s*=\s*(\[[\s\S]*?\]);?\s*$/);

if (!popularCarsMatch) {
  console.error('Failed to parse car-data.ts');
  process.exit(1);
}

const popularCars = JSON.parse(popularCarsMatch[1]);

function normalize(str) {
  if (!str) return '';
  return str.replace(/\s+/g, '').replace(/\([^)]+\)/g, '').toLowerCase();
}

let matchedCount = 0;
for (const car of popularCars) {
  const normModel = normalize(car.modelName);
  
  // Find exact match or fuzzy match in matrix
  let match = carMatrix.find(c => normalize(c.name) === normModel);
  if (!match) {
    match = carMatrix.find(c => normalize(c.name).includes(normModel) || normModel.includes(normalize(c.name)));
  }

  if (match) {
    matchedCount++;
    car.imageUrl = match.thumbnailUrl;
  } else {
    console.log(`  No match for: ${car.modelName} (slug: ${car.slug})`);
  }
}

console.log(`Matched ${matchedCount} out of ${popularCars.length} cars`);
// Save back to check
const output = `// Auto-generated from Chasalddae crawling\nexport const popularCars = ${JSON.stringify(popularCars, null, 2)};\n`;
fs.writeFileSync('prisma/car-data.ts', output, 'utf8');
console.log('Saved back to car-data.ts');
