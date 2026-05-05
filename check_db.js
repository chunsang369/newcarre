const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const c = await prisma.car.findFirst({ where: { modelName: '디 올 뉴 팰리세이드' } });
  console.log(JSON.stringify(c.options, null, 2).substring(0, 1500));
  await prisma.$disconnect();
}
check();
