const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const activeCars = await prisma.car.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, modelName: true, brand: { select: { name: true } } }
  });

  const totalCars = await prisma.car.count();

  console.log(`=== 현재 DB 차량 수 집계 ===`);
  console.log(`- 전체 DB 차량 레코드: ${totalCars}개`);
  console.log(`- 노출 중인 활성(isActive: true) 차량: ${activeCars.length}개`);

  // 브랜드별 차종 수
  const brandCount = {};
  activeCars.forEach(c => {
    const bName = c.brand?.name || '기타';
    brandCount[bName] = (brandCount[bName] || 0) + 1;
  });

  console.log(`\n=== 브랜드별 차량 수 ===`);
  console.log(JSON.stringify(brandCount, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
