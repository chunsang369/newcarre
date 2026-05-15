
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reviews = await prisma.review.findMany();

  console.log(`Processing ${reviews.length} reviews...`);

  for (const review of reviews) {
    let updatedTitle = review.title;
    let updatedContent = review.content;
    let updatedPlannerName = review.plannerName;

    // 1. Replace company name
    const companyPattern = /황제오토플랜/g;
    updatedTitle = updatedTitle.replace(companyPattern, "하이카즈");
    updatedContent = updatedContent.replace(companyPattern, "하이카즈");

    // 2. Replace Team Leader names with generic terms
    // Pattern: [Name] 팀장님 / [Name] 팀장 / [Name]팀장 / [Name]팀장님
    // Note: Names are usually 2-4 characters
    const teamLeaderPattern = /[가-힣]{2,4}\s?팀장님?/g;
    
    // Check if it's a specific name we saw or generic pattern
    updatedTitle = updatedTitle.replace(teamLeaderPattern, "담당 매니저님");
    updatedContent = updatedContent.replace(teamLeaderPattern, "담당 매니저님");
    
    if (updatedPlannerName) {
        updatedPlannerName = updatedPlannerName.replace(teamLeaderPattern, "담당 매니저");
    }

    // 3. More natural replacements if specific strings are found
    // If title becomes "담당 매니저님 최고입니다", maybe change to "상담이 정말 친절합니다" or something
    if (updatedTitle.includes("매니저님 최고")) {
        updatedTitle = updatedTitle.replace("매니저님 최고입니다", "정말 친절하고 감사합니다");
    }

    // Clean up content: "마지막으로 하이카즈에게! : " 
    // This is a specific structure from the original site.
    updatedContent = updatedContent.replace(/마지막으로 하이카즈에게!/g, "하이카즈 이용 후기");

    // Perform update if changed
    if (updatedTitle !== review.title || updatedContent !== review.content || updatedPlannerName !== review.plannerName) {
      await prisma.review.update({
        where: { id: review.id },
        data: {
          title: updatedTitle,
          content: updatedContent,
          plannerName: updatedPlannerName
        }
      });
      console.log(`Updated review: ${review.id}`);
    }
  }

  console.log("Cleanup complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
