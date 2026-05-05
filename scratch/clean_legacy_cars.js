const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany();

  let valid = 0;
  let invalid = 0;
  const idsToDelete = [];

  for (const car of cars) {
    let isValid = false;
    if (car.options && typeof car.options === 'object') {
      const opt = car.options;
      // It must be in the direct Chasalddae format
      if (opt.car_info && opt.lineup_trim_list) {
        isValid = true;
      }
    }

    if (isValid) {
      valid++;
    } else {
      invalid++;
      idsToDelete.push(car.id);
    }
  }

  console.log(`Total cars in DB: ${cars.length}`);
  console.log(`Valid Chasalddae cars: ${valid}`);
  console.log(`Invalid / Legacy cars to delete: ${invalid}`);

  if (idsToDelete.length > 0) {
    const deleteResult = await prisma.car.deleteMany({
      where: {
        id: { in: idsToDelete }
      }
    });
    console.log(`Successfully deleted ${deleteResult.count} invalid/legacy cars.`);
  }
}

main().finally(() => prisma.$disconnect());
