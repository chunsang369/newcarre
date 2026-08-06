const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const car = await prisma.car.findUnique({ where: { slug: 'tesla-model-y-juniper-6342' } });
  if (car) {
    console.log('Model Y Juniper 6342 (Long Range) found!');
    console.log('ID:', car.id);
    console.log('BasePrice:', car.basePrice);
    console.log('PriceMatrix:', JSON.stringify(car.priceMatrix, null, 2));
  } else {
    console.log('Model Y Juniper 6342 not found in DB');
  }
  await prisma.$disconnect();
}

check();
