const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const car = await prisma.car.findFirst({
    where: {
      options: {
        path: ['detailedConfig'],
        not: null
      }
    }
  });

  if (car) {
    console.log('Model:', car.modelName);
    console.log('Detailed Config:', JSON.stringify(car.options.detailedConfig, null, 2));
  } else {
    console.log('No car with detailedConfig found.');
  }
}

test().finally(() => prisma.$disconnect());
