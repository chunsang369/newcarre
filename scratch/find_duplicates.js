const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({
    select: {
      id: true,
      modelName: true,
      slug: true,
    }
  });

  const modelMap = {};
  const duplicates = [];

  for (const car of cars) {
    if (modelMap[car.modelName]) {
      modelMap[car.modelName].push(car.id);
      if (modelMap[car.modelName].length === 2) {
        duplicates.push(car.modelName);
      }
    } else {
      modelMap[car.modelName] = [car.id];
    }
  }

  console.log(`Duplicate model name count: ${duplicates.length}`);
  console.log(`Examples of duplicates:`, duplicates.slice(0, 5));
}

main().finally(() => prisma.$disconnect());
