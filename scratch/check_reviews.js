const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reviews = await prisma.review.findMany({
    take: 5
  });
  console.log(JSON.stringify(reviews, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
