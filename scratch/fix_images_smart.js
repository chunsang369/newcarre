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
  return str
    .replace(/\([^)]+\)/g, '')
    .replace(/[-\s]+/g, '')
    .replace(/ⅲ/g, '3')
    .replace(/ⅱ/g, '2')
    .replace(/ⅳ/g, '4')
    .replace(/i/g, '1')
    .toLowerCase();
}

let matchedCount = 0;
const brandMap = {}; // store fallback by brand slug or brand name

// First pass: extract all good matching image URLs
for (const car of popularCars) {
  const normModel = normalize(car.modelName);
  
  let match = carMatrix.find(c => normalize(c.name) === normModel);
  if (!match) {
    match = carMatrix.find(c => normalize(c.name).includes(normModel) || normModel.includes(normalize(c.name)));
  }

  if (match) {
    matchedCount++;
    car.imageUrl = match.thumbnailUrl;
    if (!brandMap[car.brandSlug]) {
      brandMap[car.brandSlug] = match.thumbnailUrl;
    }
  }
}

// Second pass: fill in fallbacks using sub-string matching or same-brand image fallback
for (const car of popularCars) {
  if (!car.imageUrl || car.imageUrl === 'https://img.chasalddae.com/app/logo.png') {
    // Try to find any car in matrix that contains a part of modelName
    const words = car.modelName.split(/\s+/).filter(w => w.length > 1);
    let match = null;
    for (const w of words) {
      const normW = normalize(w);
      match = carMatrix.find(c => normalize(c.name).includes(normW));
      if (match) break;
    }

    if (match) {
      car.imageUrl = match.thumbnailUrl;
      matchedCount++;
    } else {
      // Fallback to same brand first image
      if (brandMap[car.brandSlug]) {
        car.imageUrl = brandMap[car.brandSlug];
        matchedCount++;
      }
    }
  }
}

console.log(`Matched ${matchedCount} out of ${popularCars.length} cars`);

// Save back
const output = `// Auto-generated from Chasalddae crawling\nexport const popularCars = ${JSON.stringify(popularCars, null, 2)};\n`;
fs.writeFileSync('prisma/car-data.ts', output, 'utf8');
console.log('Successfully saved back to car-data.ts');
