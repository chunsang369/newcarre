const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({
    select: {
      options: true
    }
  });

  let totalTrims = 0;
  for (const car of cars) {
    if (car.options && typeof car.options === 'object') {
      const lineup = car.options.lineup_trim_list;
      if (Array.isArray(lineup)) {
        for (const line of lineup) {
          if (Array.isArray(line.trim_list)) {
            totalTrims += line.trim_list.length;
          }
        }
      }
    }
  }

  console.log(`Total Trims across all cars in our DB: ${totalTrims}`);
}

main().finally(() => prisma.$disconnect());
