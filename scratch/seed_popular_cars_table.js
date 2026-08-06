const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding PopularCar Table for Instant "인기차" Display...');

  const activeCars = await prisma.car.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    take: 30
  });

  await prisma.popularCar.deleteMany({});

  let count = 0;
  for (const car of activeCars) {
    count++;
    await prisma.popularCar.create({
      data: {
        carId: car.id,
        rank: count,
        salesCount: 1000 - count * 20,
        change: 'SAME'
      }
    });
  }

  console.log(`✅ Successfully seeded ${count} cars into PopularCar table!`);
  await prisma.$disconnect();
}

main().catch(console.error);
