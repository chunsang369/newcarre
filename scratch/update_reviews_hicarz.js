const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const reviews = await prisma.review.findMany({});
  console.log(`Scanning ${reviews.length} reviews...`);

  let updateCount = 0;
  for (const r of reviews) {
    let hasChanged = false;
    let newTitle = r.title;
    let newContent = r.content;
    let newPlannerName = r.plannerName;

    if (r.title && r.title.includes("하이카즈")) {
      newTitle = r.title.replace(/하이카즈/g, "제로카즈");
      hasChanged = true;
    }
    if (r.content && r.content.includes("하이카즈")) {
      newContent = r.content.replace(/하이카즈/g, "제로카즈");
      hasChanged = true;
    }
    if (r.plannerName && r.plannerName.includes("하이카즈")) {
      newPlannerName = r.plannerName.replace(/하이카즈/g, "제로카즈");
      hasChanged = true;
    }

    if (hasChanged) {
      await prisma.review.update({
        where: { id: r.id },
        data: {
          title: newTitle,
          content: newContent,
          plannerName: newPlannerName,
        },
      });
      updateCount++;
    }
  }

  console.log(`Updated ${updateCount} reviews to refer to "제로카즈" instead of "하이카즈".`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
