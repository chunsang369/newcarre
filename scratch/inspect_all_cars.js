const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({
    include: { brand: true }
  });

  console.log(`총 DB 차량 수: ${cars.length}개\n`);

  const carSummary = cars.map(c => {
    const grades = c.options?.grades || [];
    const trimIds = [];
    grades.forEach(g => {
      g.trims?.forEach(t => {
        if (t.trimId) trimIds.push(t.trimId);
      });
    });

    return {
      id: c.id,
      slug: c.slug,
      brand: c.brand.name,
      modelName: c.modelName,
      trimIds: trimIds,
      hasMatrix: !!c.priceMatrix
    };
  });

  console.log(JSON.stringify(carSummary, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
