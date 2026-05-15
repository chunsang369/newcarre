
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const RANDOM_TITLES = [
  "장기렌트 대만족 후기입니다!",
  "신차 출고까지 정말 빠르네요. 감사합니다.",
  "비교견적 받아보길 정말 잘했어요.",
  "저신용이었는데도 승인해주셔서 감사합니다.",
  "상담이 너무 친절해서 믿고 진행했습니다.",
  "다음 차도 꼭 여기서 하고 싶어요!",
  "조건이 너무 좋아서 바로 계약했습니다.",
  "빠른 출고와 꼼꼼한 설명에 감동받았습니다.",
  "주변 지인들에게도 강력 추천하고 있어요.",
  "친절한 안내 덕분에 기분 좋게 차 받았습니다.",
  "합리적인 가격으로 신차 타게 되어 기쁘네요.",
  "고민 많았는데 명쾌하게 해결해주셨습니다.",
  "하이카즈 덕분에 원하는 차 빨리 받았습니다!",
  "상담부터 출고까지 완벽했습니다.",
  "역시 하이카즈네요. 매우 만족합니다.",
  "매니저님 덕분에 좋은 차 저렴하게 잘 받았습니다.",
  "여러 곳 비교해봤는데 여기가 제일 좋네요.",
  "신속한 업무 처리와 친절한 상담 감사합니다."
];

async function main() {
  const reviews = await prisma.review.findMany();

  console.log(`Updating ${reviews.length} reviews...`);

  for (let i = 0; i < reviews.length; i++) {
    const review = reviews[i];
    let updatedTitle = review.title;
    let updatedContent = review.content;
    let needsUpdate = false;

    // 1. Remove specific names and titles
    const namesToRemove = [/주균필\s?차장님/g, /담당\s?매니저님/g, /담당\s?매니저/g];
    
    // Check if title is generic or repetitive
    const isRepetitiveTitle = updatedTitle.includes("담당 매니저님 감사합니다") || 
                              updatedTitle.includes("담당 매니저님!") ||
                              updatedTitle.length < 5;

    // 2. Apply "주균필 차장님" specific fix
    if (updatedTitle.includes("주균필 차장님")) {
      updatedTitle = updatedTitle.replace(/주균필\s?차장님/g, "").trim();
      if (updatedTitle === "") updatedTitle = "차량 출고 후기";
      needsUpdate = true;
    }

    // 3. Randomize repetitive titles
    if (isRepetitiveTitle) {
      updatedTitle = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
      needsUpdate = true;
    }

    // 4. Final check for any remaining team leader/planner phrases in content
    if (updatedContent.includes("주균필")) {
        updatedContent = updatedContent.replace(/주균필\s?차장님/g, "담당 매니저님").replace(/주균필/g, "매니저");
        needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.review.update({
        where: { id: review.id },
        data: {
          title: updatedTitle,
          content: updatedContent
        }
      });
      console.log(`Updated title for review ${review.id} to: ${updatedTitle}`);
    }
  }

  console.log("Database update complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
