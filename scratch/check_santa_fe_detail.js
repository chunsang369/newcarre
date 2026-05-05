const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const car = await prisma.car.findUnique({
    where: { slug: 'hyundai-디-올-뉴-싼타페-mx5' },
  });

  console.log(JSON.stringify(car, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
