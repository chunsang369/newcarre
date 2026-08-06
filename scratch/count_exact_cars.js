const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const activeCount = await prisma.car.count({ where: { isActive: true } });
  console.log(`DB 활성 차량 수: ${activeCount}개`);

  await prisma.$disconnect();
}

main().catch(console.error);
