const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({
    select: {
      id: true,
      modelName: true,
      brand: { select: { name: true } }
    },
    orderBy: { modelName: 'asc' }
  });

  console.log(`Listing first 50 cars:`);
  for (const car of cars.slice(0, 50)) {
    console.log(`- [${car.brand.name}] ${car.modelName}`);
  }
}

main().finally(() => prisma.$disconnect());
