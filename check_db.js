const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const popularData = [
  { rank: 1, slug: 'kia-the-new-sorento', salesCount: 12078, change: '1,208▲' },
  { rank: 2, slug: 'tesla-model-y-juniper', salesCount: 10086, change: '3,337▲' },
  { rank: 3, slug: 'hyundai-grandeur', salesCount: 6622, change: '952▼' },
  { rank: 4, slug: 'hyundai-sonata-the-edge', salesCount: 5754, change: '32▼' },
  { rank: 5, slug: 'hyundai-the-new-avante', salesCount: 5350, change: '36▼' },
  { rank: 6, slug: 'kia-the-new-carnival', salesCount: 4995, change: '412▼' },
  { rank: 7, slug: 'kia-the-new-sportage', salesCount: 4972, change: '568▼' },
  { rank: 8, slug: 'tesla-new-model-3', salesCount: 2596, change: '1,106▼' },
  { rank: 9, slug: 'bmw-5-series', salesCount: 1887, change: '13▼' },
  { rank: 10, slug: 'mercedes-benz-the-new-e-class', salesCount: 1695, change: '646▼' }
];

async function seedPopularCars() {
  console.log("Cleaning PopularCar table...");
  await prisma.popularCar.deleteMany({});

  console.log("Seeding PopularCar table...");
  for (const item of popularData) {
    const car = await prisma.car.findUnique({
      where: { slug: item.slug }
    });

    if (!car) {
      console.error(`Car not found for slug: ${item.slug}`);
      continue;
    }

    await prisma.popularCar.create({
      data: {
        carId: car.id,
        rank: item.rank,
        salesCount: item.salesCount,
        change: item.change
      }
    });
    console.log(`Successfully added rank ${item.rank}: ${car.modelName} (${item.slug})`);
  }

  console.log("Seed finished successfully!");
  await prisma.$disconnect();
}

seedPopularCars().catch(err => {
  console.error(err);
  prisma.$disconnect();
});


