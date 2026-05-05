const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({
    take: 5,
    select: {
      id: true,
      modelName: true,
      thumbnailUrl: true,
    }
  });
  console.log(JSON.stringify(cars, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
