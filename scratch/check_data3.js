// Check car-data.ts by reading it as text and parsing
const fs = require('fs');

// Read the car-data.ts file content
const content = fs.readFileSync('../prisma/car-data.ts', 'utf-8');

// Find first occurrence of detailedConfig
const idx = content.indexOf('detailedConfig');
if (idx >= 0) {
  console.log('detailedConfig found at position:', idx);
  console.log('Context:', content.substring(idx - 100, idx + 500));
} else {
  console.log('No detailedConfig in car-data.ts');
}

// Check what options look like
const optIdx = content.indexOf('"options"');
if (optIdx >= 0) {
  console.log('\nFirst "options" at position:', optIdx);
  console.log('Context:', content.substring(optIdx, optIdx + 500));
}

// Count all vehicles
const slugMatches = content.match(/"slug":/g);
console.log('\nTotal vehicles in car-data.ts:', slugMatches?.length || 0);

// Check category values used
const catMatches = [...content.matchAll(/"category":\s*"([^"]+)"/g)];
const catCounts = {};
catMatches.forEach(m => { catCounts[m[1]] = (catCounts[m[1]] || 0) + 1; });
console.log('Categories:', JSON.stringify(catCounts));

// Check basePrice values
const priceMatches = [...content.matchAll(/"basePrice":\s*(\d+)/g)];
const nonZero = priceMatches.filter(m => m[1] !== '0');
console.log('basePrice entries:', priceMatches.length, 'non-zero:', nonZero.length);
if (nonZero.length > 0) {
  console.log('Examples:', nonZero.slice(0, 5).map(m => m[1]));
}
