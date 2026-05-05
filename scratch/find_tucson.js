const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({
    where: { modelName: { contains: '투싼' } }
  });
  console.log(JSON.stringify(cars, null, 2));
}

main().finally(() => prisma.$disconnect());
