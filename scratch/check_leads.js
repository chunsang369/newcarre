const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.quoteRequest.findMany({
    where: {
      carConfig: { not: null }
    },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(leads, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
