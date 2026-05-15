
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const count = await prisma.review.count({
    where: {
      OR: [
        { title: { contains: '주균필' } },
        { content: { contains: '주균필' } },
        { title: { contains: '차장님' } }
      ]
    }
  });
  console.log('Remaining problematic matches:', count);
  await prisma.$disconnect();
}
check();
