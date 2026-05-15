
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
  "신속한 업무 처리와 친절한 상담 감사합니다.",
  "꿈에 그리던 신차, 드디어 출고했습니다!",
  "꼼꼼한 사후관리까지 정말 최고예요."
];

async function main() {
  const reviews = await prisma.review.findMany();

  console.log(`Deep cleaning ${reviews.length} reviews...`);

  for (const review of reviews) {
    let updatedTitle = review.title;
    let updatedContent = review.content;
    let needsUpdate = false;

    // 1. Remove "주균필" and "차장님" wherever they appear
    if (updatedTitle.includes("주균필") || updatedTitle.includes("차장님")) {
      updatedTitle = updatedTitle.replace(/주균필/g, "").replace(/차장님/g, "").trim();
      // Clean up punctuation left behind
      updatedTitle = updatedTitle.replace(/^[^\w가-힣]+|[^\w가-힣]+$/g, "").trim();
      needsUpdate = true;
    }

    if (updatedContent.includes("주균필") || updatedContent.includes("차장님")) {
      updatedContent = updatedContent.replace(/주균필/g, "매니저").replace(/차장님/g, "님").trim();
      needsUpdate = true;
    }

    // 2. If title is still problematic or too short, randomize it
    const problematicKeywords = ["담당", "매니저", "감사", "후기", "출고"];
    const isRepetitive = updatedTitle.length < 5 || 
                         (updatedTitle.includes("담당") && updatedTitle.includes("감사")) ||
                         updatedTitle === "차량출고후기";

    if (isRepetitive) {
      updatedTitle = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
      needsUpdate = true;
    }

    // 3. Ensure title is not empty
    if (!updatedTitle || updatedTitle.trim() === "") {
        updatedTitle = "하이카즈 차량 출고 후기";
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
      console.log(`[${review.id}] Updated Title: ${updatedTitle}`);
    }
  }

  console.log("Deep clean complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
