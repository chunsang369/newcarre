
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reviews = await prisma.review.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      customerName: true,
      plannerName: true
    }
  });

  console.log(JSON.stringify(reviews, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
