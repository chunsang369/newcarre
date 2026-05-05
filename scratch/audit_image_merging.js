const fs = require('fs');

const scrapedCars = JSON.parse(fs.readFileSync('scratch/chasalddae_scraped_images.json', 'utf8'));
const carDataText = fs.readFileSync('prisma/car-data.ts', 'utf8');
const popularCarsMatch = carDataText.match(/export const popularCars\s*=\s*(\[[\s\S]*?\]);?\s*$/);
const popularCars = JSON.parse(popularCarsMatch[1]);

function normalize(str) {
  if (!str) return '';
  return str
    .replace(/\([^)]+\)/g, '')
    .replace(/[-\s]+/g, '')
    .toLowerCase();
}

console.log('Sample matching test:');
const testCases = ['더 뉴 아반떼', '더 뉴 아반떼 N', '쏘나타 디 엣지'];
for (const tc of testCases) {
  const normTc = normalize(tc);
  const found = scrapedCars.find(sc => normalize(sc.model_name) === normTc);
  console.log(`Test case "${tc}" normalized: "${normTc}". Found in scraped cars?`, found ? found.model_name : 'No');
}

let unMatched = [];
for (const car of popularCars) {
  if (car.imageUrl.includes('hicarzautoplan')) {
    unMatched.push(car.modelName);
  }
}
console.log(`Unmatched (retaining hicarz URLs): ${unMatched.length} cars`);
console.log(unMatched.slice(0, 20));
