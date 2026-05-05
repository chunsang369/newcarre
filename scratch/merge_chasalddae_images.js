const fs = require('fs');

const scrapedCars = JSON.parse(fs.readFileSync('scratch/chasalddae_scraped_images.json', 'utf8'));
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

for (const car of popularCars) {
  const normModel = normalize(car.modelName);
  
  // Find match in scraped cars
  let match = scrapedCars.find(c => normalize(c.model_name) === normModel);
  if (!match) {
    // try substring match
    match = scrapedCars.find(c => normalize(c.model_name).includes(normModel) || normModel.includes(normalize(c.model_name)));
  }

  if (match) {
    matchedCount++;
    car.imageUrl = match.car_image1;
  }
}

console.log(`Matched ${matchedCount} out of ${popularCars.length} cars with Chasalddae scraped images.`);

// Save back
const output = `// Auto-generated from Chasalddae crawling\nexport const popularCars = ${JSON.stringify(popularCars, null, 2)};\n`;
fs.writeFileSync('prisma/car-data.ts', output, 'utf8');
console.log('Successfully saved back to car-data.ts');
