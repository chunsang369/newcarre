const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({
    where: { modelName: { contains: '그랜저' } },
    take: 5
  });
  console.log(JSON.stringify(cars, null, 2));
}

main();
