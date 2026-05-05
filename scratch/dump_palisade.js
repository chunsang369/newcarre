const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const car = await prisma.car.findFirst({
    where: { modelName: { contains: '팰리세이드' } }
  });
  console.log(JSON.stringify(car.options, null, 2));
}

main().finally(() => prisma.$disconnect());
