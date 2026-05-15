
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reviews = await prisma.review.findMany();

  console.log(`Final cleaning of ${reviews.length} reviews...`);

  for (const review of reviews) {
    let updatedTitle = review.title;
    let updatedContent = review.content;

    // 1. Replace [Surname]매니저님 or [Surname]담당 매니저님
    // Pattern: 1 character surname followed by 매니저님/매니저
    const surnameManagerPattern = /[가-힣]{1}(담당\s?)?매니저님?/g;
    updatedTitle = updatedTitle.replace(surnameManagerPattern, "담당 매니저님");
    updatedContent = updatedContent.replace(surnameManagerPattern, "담당 매니저님");

    // 2. Clean up any remaining company name references
    updatedTitle = updatedTitle.replace(/황제오토/g, "하이카즈").replace(/황제/g, "하이카즈");
    updatedContent = updatedContent.replace(/황제오토/g, "하이카즈").replace(/황제/g, "하이카즈");

    // 3. Fix potential "담당 담당 매니저님"
    updatedTitle = updatedTitle.replace(/담당\s?담당\s?매니저님/g, "담당 매니저님");
    updatedContent = updatedContent.replace(/담당\s?담당\s?매니저님/g, "담당 매니저님");

    // 4. Ensure no "팀장" remains
    updatedTitle = updatedTitle.replace(/팀장님?/g, "매니저님");
    updatedContent = updatedContent.replace(/팀장님?/g, "매니저님");

    // Perform update if changed
    if (updatedTitle !== review.title || updatedContent !== review.content) {
      await prisma.review.update({
        where: { id: review.id },
        data: {
          title: updatedTitle,
          content: updatedContent
        }
      });
      console.log(`Final cleaned review: ${review.id}`);
    }
  }

  console.log("Final cleanup complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
