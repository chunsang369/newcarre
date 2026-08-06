const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({ take: 10 });
  console.log('Sample 10 cars in DB:');
  cars.forEach(c => {
    console.log(`- ${c.modelName} (${c.slug})`);
    console.log(`  thumbnailUrl: ${c.thumbnailUrl}`);
    console.log(`  priceMatrix sample (36_PREPAY_30_20000):`, c.priceMatrix?.['36_PREPAY_30_20000']);
    const trimMatrix = c.options?.grades?.[0]?.trims?.[0]?.priceMatrix;
    console.log(`  trim priceMatrix sample:`, trimMatrix?.['36_PREPAY_30_20000']);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
