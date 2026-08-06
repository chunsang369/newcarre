const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const slugs = ['tesla-new-model-3-8545', 'tesla-new-model-3-8546', 'tesla-new-model-3'];

  for (const slug of slugs) {
    const car = await prisma.car.findUnique({ where: { slug } });
    console.log(`\n=== Car: ${slug} ===`);
    if (car) {
      console.log('ID:', car.id);
      console.log('BasePrice:', car.basePrice);
      console.log('PriceMatrix keys:', Object.keys(car.priceMatrix || {}).length);
      console.log('Sample Price (48_PREPAY_30_20000):', JSON.stringify(car.priceMatrix?.['48_PREPAY_30_20000']));
    } else {
      console.log(`Car with slug ${slug} NOT FOUND`);
    }
  }

  await prisma.$disconnect();
}

check();
