const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const reviews = await p.review.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, title: true, content: true, sortOrder: true }
  });
  reviews.forEach(x => {
    console.log(x.sortOrder + ' | ' + x.title);
  });
  console.log('\n총 ' + reviews.length + '개');
  await p.$disconnect();
}
main().catch(e => { console.error(e); p.$disconnect(); });
