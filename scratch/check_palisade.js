const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({
    where: { modelName: { contains: '팰리세이드' } }
  });
  
  for (const car of cars) {
    console.log(`- Model: ${car.modelName} | Base Price: ${car.basePrice}`);
    if (car.options && typeof car.options === 'object') {
      const opt = car.options;
      console.log(`  Trim Count: ${opt.lineup_trim_list ? opt.lineup_trim_list.length : 0}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
