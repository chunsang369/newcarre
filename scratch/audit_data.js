const fs = require('fs');
const d = JSON.parse(fs.readFileSync('scratch/chasalddae_details.json', 'utf8'));
const keys = Object.keys(d);

let withOpts = 0, withColors = 0, total = keys.length;
for (const k of keys) {
  if (d[k].options && d[k].options.length > 0) withOpts++;
  if (d[k].colorsExt && d[k].colorsExt.length > 0) withColors++;
}
console.log('=== DATA QUALITY AUDIT ===');
console.log('Total cars:', total);
console.log('Cars WITH options:', withOpts);
console.log('Cars WITHOUT options:', total - withOpts);
console.log('Cars WITH colors:', withColors);

// Option count distribution
const optCounts = {};
for (const k of keys) {
  const n = d[k].options ? d[k].options.length : 0;
  optCounts[n] = (optCounts[n] || 0) + 1;
}
console.log('\nOption count distribution:', JSON.stringify(optCounts, null, 2));

// Image analysis
const imgCounts = {};
for (const k of keys) {
  const u = d[k].imageUrl || 'none';
  imgCounts[u] = (imgCounts[u] || 0) + 1;
}
const logoFallback = imgCounts['https://img.chasalddae.com/app/logo.png'] || 0;
console.log('\nUnique image URLs:', Object.keys(imgCounts).length);
console.log('Using logo.png fallback:', logoFallback, '/', total);

// Show a few cars with actual images
console.log('\nCars with real images:');
for (const k of keys) {
  if (d[k].imageUrl && !d[k].imageUrl.includes('logo.png')) {
    console.log(`  ${d[k].fullName}: ${d[k].imageUrl}`);
  }
}

// Show a few cars with options to understand structure
console.log('\n=== SAMPLE CARS WITH OPTIONS ===');
let shown = 0;
for (const k of keys) {
  if (d[k].options && d[k].options.length > 3 && shown < 3) {
    console.log(`\n${d[k].fullName} (trimId: ${d[k].trimId}):`);
    console.log('  Grades:', d[k].grades.length);
    console.log('  Options:', JSON.stringify(d[k].options.slice(0, 5), null, 4));
    console.log('  colorsExt:', d[k].colorsExt.length);
    console.log('  colorsInt:', d[k].colorsInt.length);
    shown++;
  }
}

// Check brand distribution
const brands = {};
for (const k of keys) {
  brands[d[k].brand] = (brands[d[k].brand] || 0) + 1;
}
console.log('\n=== BRAND DISTRIBUTION ===');
Object.entries(brands).sort((a, b) => b[1] - a[1]).forEach(([brand, count]) => {
  console.log(`  ${brand}: ${count} models`);
});
