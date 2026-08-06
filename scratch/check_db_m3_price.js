const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const car = await prisma.car.findUnique({ where: { slug: 'tesla-new-model-3' } });
  const trim = car.options.grades[0].trims[0];
  console.log('DB에 들어있는 Standard 트림 name:', trim.name);
  console.log('DB에 들어있는 36m prepay30 20k:', trim.priceMatrix['36_PREPAY_30_20000']);
  console.log('DB에 들어있는 48m prepay30 20k:', trim.priceMatrix['48_PREPAY_30_20000']);
  console.log('DB에 들어있는 60m prepay30 20k:', trim.priceMatrix['60_PREPAY_30_20000']);
  await prisma.$disconnect();
}

main().catch(console.error);
