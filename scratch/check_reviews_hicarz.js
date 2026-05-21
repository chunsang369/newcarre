const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const reviews = await prisma.review.findMany({
    where: {
      OR: [
        { title: { contains: "하이카즈" } },
        { content: { contains: "하이카즈" } },
        { plannerName: { contains: "하이카즈" } }
      ]
    }
  });

  console.log(`Found ${reviews.length} reviews matching "하이카즈"`);
  for (const r of reviews) {
    console.log(`- Review ID: ${r.id}, Title: ${r.title}, Planner: ${r.plannerName}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
