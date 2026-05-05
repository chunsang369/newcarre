const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const carCount = await prisma.car.count();
  const cars = await prisma.car.findMany({
    take: 5,
    select: {
      id: true,
      modelName: true,
      options: true
    }
  });

  console.log(`Current car count in DB: ${carCount}`);
  for (const car of cars) {
    if (car.options && typeof car.options === 'object') {
      const opt = car.options;
      console.log(`- ${car.modelName}: has lineup_trim_list: ${!!opt.lineup_trim_list}, trim_opt_list: ${!!opt.trim_opt_list}, trim_outer_color_list: ${!!opt.trim_outer_color_list}`);
    } else {
      console.log(`- ${car.modelName}: options field is not an object or empty`);
    }
  }
}

main().finally(() => prisma.$disconnect());
