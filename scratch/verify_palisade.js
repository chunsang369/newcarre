const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const car = await p.car.findFirst({
    where: { modelName: { contains: '팰리세이드' } },
    select: { options: true }
  });
  
  if (!car || !car.options || !car.options.detailedConfig) {
    console.log('Car or detailedConfig not found');
    return;
  }
  
  const dc = car.options.detailedConfig;
  const grade = dc.grades[0];
  const trim = grade.trims[0];
  
  console.log('Model:', car.modelName);
  console.log('Trim:', trim.name);
  console.log('Total options:', trim.options.length);
  console.log('Options with price > 0:', trim.options.filter(o => o.price > 0).length);
  console.log('Example option:', trim.options.find(o => o.price > 0) || trim.options[0]);
  console.log('Ext colors:', trim.colorsExt.length);
  console.log('Int colors:', trim.colorsInt.length);
}

main().finally(() => p.$disconnect());
