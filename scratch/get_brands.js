const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const brands = await prisma.brand.findMany({
    select: { name: true, slug: true, isDomestic: true },
    orderBy: { name: 'asc' }
  });
  console.log(JSON.stringify(brands, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
