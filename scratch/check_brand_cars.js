const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const brands = await prisma.brand.findMany({
    include: {
      _count: {
        select: { cars: true }
      }
    }
  });
  console.log("Brands with cars count:");
  brands.forEach(b => {
    console.log(`- ${b.name} (${b.slug}): ${b._count.cars} cars`);
  });

  const popularCars = await prisma.popularCar.findMany({
    include: {
      car: {
        include: { brand: true }
      }
    }
  });
  console.log("\nPopular cars in DB:");
  popularCars.forEach(pc => {
    console.log(`- Rank ${pc.rank}: ${pc.car.brand.name} ${pc.car.modelName} (${pc.car.slug})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
