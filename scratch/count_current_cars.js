const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.car.count({
    where: { isActive: true }
  });
  const total = await prisma.car.count();

  console.log(`현재 활성(isActive: true) 차량 수: ${count}대`);
  console.log(`전체 DB 레코드 수: ${total}대`);

  await prisma.$disconnect();
}

main().catch(console.error);
