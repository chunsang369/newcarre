const d = require('../cars_final_database.json');

// Check first car's actual keys
const c = d[0];
console.log('=== First Car Keys ===');
console.log(Object.keys(c));
console.log(JSON.stringify(c, null, 2).substring(0, 2000));

// Check car-data.ts data
const { popularCars } = require('../prisma/car-data');
console.log('\n=== car-data.ts ===');
console.log('Total:', popularCars.length);
const withConfig2 = popularCars.filter(x => x.options && x.options.detailedConfig);
console.log('With detailedConfig:', withConfig2.length);
if (withConfig2.length > 0) {
  const ex = withConfig2[0];
  console.log('Example:', ex.modelName);
  const dc = ex.options.detailedConfig;
  console.log('Grades count:', dc.grades?.length);
  if (dc.grades?.[0]) {
    const g = dc.grades[0];
    console.log('Grade[0]:', g.name);
    console.log('Trims count:', g.trims?.length);
    if (g.trims?.[0]) {
      console.log('Trim[0]:', JSON.stringify({name: g.trims[0].name, price: g.trims[0].price}));
    }
  }
}

// Check categories in car-data.ts
const cats2 = {};
popularCars.forEach(x => { cats2[x.category] = (cats2[x.category] || 0) + 1; });
console.log('\nCategories:', JSON.stringify(cats2));

// basePrice in car-data.ts
const withPrice2 = popularCars.filter(x => x.basePrice > 0);
console.log('With basePrice > 0:', withPrice2.length);

// SUV-type vehicles still labeled as SEDAN
const suvLikeCars = popularCars.filter(x => 
  x.category === 'SEDAN' && 
  (x.modelName.includes('팰리세이드') || x.modelName.includes('싼타페') || 
   x.modelName.includes('투싼') || x.modelName.includes('코나') ||
   x.modelName.includes('셀토스') || x.modelName.includes('스포티지') ||
   x.modelName.includes('쏘렌토') || x.modelName.includes('베뉴') ||
   x.modelName.includes('넥쏘'))
);
console.log('\n=== SUV-like cars labeled SEDAN ===');
suvLikeCars.forEach(c => console.log(`  ${c.modelName}: ${c.category}`));
