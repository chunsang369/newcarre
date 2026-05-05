const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({
    where: {
      isActive: true,
      brand: {
        isDomestic: true,
      },
    },
    include: {
      brand: true,
    },
    orderBy: [
      { brand: { sortOrder: "asc" } },
      { sortOrder: "asc" }
    ],
    take: 5,
  });

  console.log(cars.map(c => ({ modelName: c.modelName, thumbnailUrl: c.thumbnailUrl })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
