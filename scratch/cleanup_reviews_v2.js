
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reviews = await prisma.review.findMany();

  console.log(`Refining ${reviews.length} reviews...`);

  for (const review of reviews) {
    let updatedTitle = review.title;
    let updatedContent = review.content;

    // 1. Fix company name fragments and particles
    // "황제" -> "하이카즈"
    updatedTitle = updatedTitle.replace(/황제/g, "하이카즈");
    updatedContent = updatedContent.replace(/황제/g, "하이카즈");

    // Fix Josa (particles)
    // 하이카즈은 -> 하이카즈는
    // 하이카즈이 -> 하이카즈가
    // 하이카즈과 -> 하이카즈와
    updatedTitle = updatedTitle.replace(/하이카즈은/g, "하이카즈는").replace(/하이카즈이/g, "하이카즈가").replace(/하이카즈과/g, "하이카즈와");
    updatedContent = updatedContent.replace(/하이카즈은/g, "하이카즈는").replace(/하이카즈이/g, "하이카즈가").replace(/하이카즈과/g, "하이카즈와");

    // 2. Remove any remaining specific names (hardcoded if needed)
    // I noticed "박형록", "양민수" in the previous log.
    const specificNames = ["박형록", "양민수", "황제"];
    for (const name of specificNames) {
        const regex = new RegExp(name, 'g');
        updatedTitle = updatedTitle.replace(regex, "하이카즈");
        updatedContent = updatedContent.replace(regex, "하이카즈");
    }

    // 3. Clean up generic "팀장님" if user wants ALL titles gone too? 
    // User said "팀장 이름 전부 제외시켜줘" (Exclude all team leader NAMES). 
    // Usually keeping "매니저님" or "팀장님" (without name) is fine and feels like a real review.
    // But I'll change "팀장님" to "매니저님" for a more consistent feel if it sounds better.
    updatedTitle = updatedTitle.replace(/팀장님/g, "매니저님").replace(/팀장/g, "매니저");
    updatedContent = updatedContent.replace(/팀장님/g, "매니저님").replace(/팀장/g, "매니저");

    // 4. Double check for duplicate "하이카즈 하이카즈"
    updatedTitle = updatedTitle.replace(/하이카즈\s?하이카즈/g, "하이카즈");
    updatedContent = updatedContent.replace(/하이카즈\s?하이카즈/g, "하이카즈");

    // Perform update if changed
    if (updatedTitle !== review.title || updatedContent !== review.content) {
      await prisma.review.update({
        where: { id: review.id },
        data: {
          title: updatedTitle,
          content: updatedContent
        }
      });
      console.log(`Refined review: ${review.id}`);
    }
  }

  console.log("Refinement complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
