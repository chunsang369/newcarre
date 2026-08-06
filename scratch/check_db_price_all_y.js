const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const rwd = await prisma.car.findUnique({ where: { slug: 'tesla-model-y-juniper' } });
  const lr = await prisma.car.findUnique({ where: { slug: 'tesla-model-y-juniper-6342' } });

  console.log('=== [1] Model Y Juniper RWD (tesla-model-y-juniper) ===');
  if (rwd) {
    console.log('ID:', rwd.id);
    console.log('BasePrice:', rwd.basePrice);
    console.log('PriceMatrix keys:', Object.keys(rwd.priceMatrix || {}).length);
    console.log('Sample Price (48_PREPAY_30_20000):', JSON.stringify(rwd.priceMatrix?.['48_PREPAY_30_20000']));
  } else {
    console.log('RWD not found');
  }

  console.log('\n=== [2] Model Y Juniper Long Range (tesla-model-y-juniper-6342) ===');
  if (lr) {
    console.log('ID:', lr.id);
    console.log('BasePrice:', lr.basePrice);
    console.log('PriceMatrix keys:', Object.keys(lr.priceMatrix || {}).length);
    console.log('Sample Price (48_PREPAY_30_20000):', JSON.stringify(lr.priceMatrix?.['48_PREPAY_30_20000']));
  } else {
    console.log('Long Range not found');
  }

  await prisma.$disconnect();
}

check();
