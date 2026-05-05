const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPrices() {
  const car = await prisma.car.findFirst({
    where: { modelName: { contains: '팰리세이드' } }
  });
  
  if (!car || !car.options.detailedConfig) {
    console.log('No detailedConfig found for Palisade');
    return;
  }
  
  const grade = car.options.detailedConfig.grades[0];
  console.log(`Grade: ${grade.name}`);
  for (const trim of grade.trims) {
    console.log(`  Trim: ${trim.name}`);
    for (const opt of trim.options.slice(0, 5)) {
      console.log(`    Option: ${opt.title} -> Price: ${opt.price}`);
    }
  }
}

checkPrices().then(() => process.exit(0));
