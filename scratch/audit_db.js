const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const cars = await p.car.findMany({
    select: { id: true, modelName: true, basePrice: true, brand: { select: { name: true } }, options: true }
  });

  const domestic = cars.filter(c => ['현대','기아','제네시스','KGM','쉐보레','르노코리아'].includes(c.brand.name));
  console.log('Domestic cars:', domestic.length);
  
  const withCfg = domestic.filter(c => c.options?.detailedConfig);
  console.log('With detailedConfig:', withCfg.length);
  
  const withColors = domestic.filter(c => {
    const dc = c.options?.detailedConfig;
    if (!dc) return false;
    return dc.grades?.some(g => g.trims?.some(t => (t.colorsExt?.length > 0) || (t.colorsInt?.length > 0)));
  });
  console.log('With colors:', withColors.length);
  console.log('Cars with colors:', withColors.map(c => c.modelName));
  
  const withOptPrices = domestic.filter(c => {
    const dc = c.options?.detailedConfig;
    if (!dc) return false;
    return dc.grades?.some(g => g.trims?.some(t => t.options?.some(o => Number(o.price) > 0)));
  });
  console.log('With option prices:', withOptPrices.length);
  console.log('Cars with opt prices:', withOptPrices.map(c => c.modelName));
  
  // Check the Grandeur specifically
  const grandeur = domestic.find(c => c.modelName.includes('그랜저'));
  if (grandeur) {
    const dc = grandeur.options?.detailedConfig;
    const g = dc?.grades?.[0];
    const t = g?.trims?.[0];
    console.log('\nGrandeur first trim:', t?.name);
    console.log('Options:', t?.options?.length, 'with prices:', t?.options?.filter(o => Number(o.price) > 0).length);
    console.log('Ext colors:', t?.colorsExt?.length);
    console.log('Int colors:', t?.colorsInt?.length);
    console.log('First ext color:', t?.colorsExt?.[0]);
    console.log('First option:', t?.options?.[0]);
  }
}

main().finally(() => p.$disconnect());
