const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const cars = await p.car.findMany({
    where: { brand: { name: '현대' } },
    select: { modelName: true, options: true }
  });
  
  for (const car of cars) {
    if (car.options?.detailedConfig) {
      const dc = car.options.detailedConfig;
      const firstTrim = dc.grades?.[0]?.trims?.[0];
      if (firstTrim) {
        const pricedOpts = firstTrim.options.filter(o => o.price > 0);
        console.log(`Car: ${car.modelName} | Trim: ${firstTrim.name} | TotalOpts: ${firstTrim.options.length} | PricedOpts: ${pricedOpts.length}`);
        if (pricedOpts.length > 0) {
            console.log('  Example Priced Opt:', pricedOpts[0]);
        }
      }
    }
  }
}
main().finally(() => p.$disconnect());
