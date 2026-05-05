const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCoverage() {
  const cars = await prisma.car.findMany({
    where: { isActive: true }
  });

  let total = cars.length;
  let withDetailed = 0;
  let withPrices = 0;
  let withColors = 0;

  for (const car of cars) {
    const options = typeof car.options === 'string' ? JSON.parse(car.options) : car.options;
    if (options && options.detailedConfig) {
      withDetailed++;
      
      const hasPrices = options.detailedConfig.grades.some(g => 
        g.trims.some(t => t.options.some(o => o.price > 0))
      );
      if (hasPrices) withPrices++;

      const hasColors = options.detailedConfig.grades.some(g => 
        g.trims.some(t => t.colorsExt.length > 0 || t.colorsInt.length > 0)
      );
      if (hasColors) withColors++;
    }
  }

  console.log(`Total Cars: ${total}`);
  console.log(`With Detailed Config: ${withDetailed}`);
  console.log(`With Option Prices > 0: ${withPrices}`);
  console.log(`With Colors: ${withColors}`);

  await prisma.$disconnect();
}

checkCoverage();
