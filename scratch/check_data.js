const d = require('../cars_final_database.json');

// Check first car structure
const c = d[0];
console.log('=== First Car ===');
console.log('slug:', c.slug);
console.log('modelName:', c.modelName);
console.log('category:', c.category);
console.log('basePrice:', c.basePrice);
console.log('options keys:', c.options ? Object.keys(c.options) : 'none');

// Check how many cars have detailedConfig
const withConfig = d.filter(x => x.options && x.options.detailedConfig);
console.log('\n=== Stats ===');
console.log('Total cars:', d.length);
console.log('With detailedConfig:', withConfig.length);

// Check categories distribution
const cats = {};
d.forEach(x => { cats[x.category] = (cats[x.category] || 0) + 1; });
console.log('\nCategories:', JSON.stringify(cats));

// Check basePrice distribution
const withPrice = d.filter(x => x.basePrice > 0);
console.log('With basePrice > 0:', withPrice.length);

// Show example of detailedConfig if exists
if (withConfig.length > 0) {
  const ex = withConfig[0];
  console.log('\n=== DetailedConfig Example ===');
  console.log('Car:', ex.modelName);
  const dc = ex.options.detailedConfig;
  console.log('Grades:', dc.grades?.length);
  if (dc.grades?.[0]) {
    const g = dc.grades[0];
    console.log('Grade 0:', g.name, 'trims:', g.trims?.length);
    if (g.trims?.[0]) {
      console.log('Trim 0:', g.trims[0].name, 'price:', g.trims[0].price);
    }
  }
}
