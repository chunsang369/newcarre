const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({
    where: {
      modelName: { contains: '싼타페' }
    },
    select: {
      id: true,
      slug: true,
      modelName: true,
      trimName: true,
      thumbnailUrl: true
    }
  });

  console.log(JSON.stringify(cars, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
