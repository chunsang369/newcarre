const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({
    where: {
      thumbnailUrl: { contains: 'hicarzautoplan' }
    },
    select: {
      id: true,
      modelName: true,
      thumbnailUrl: true
    }
  });

  console.log(`Found ${cars.length} cars remaining with hicarzautoplan URL.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
