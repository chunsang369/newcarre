const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up existing FAQs...");
  await prisma.faq.deleteMany({});

  console.log("Seeding FAQ items...");

  const faqItems = [
    {
      category: "서비스 이용",
      question: "상담신청을 남겼는데 연락이 안와요.",
      answer: "상담신청을 남겨주시면 순차적으로 연락을 드리고 있습니다. 잠시만 기다려주시면 영업 담당자가 연락을 드릴 예정입니다.",
      sortOrder: 1,
      isPublished: true,
    },
    {
      category: "금융/계약",
      question: "보증금과 선수금의 차이가 무엇인가요?",
      answer: "보증금은 계약이 종료되면 고객님께 다시 돌려드리는 금액이며, 선수금은 월 렌트료를 미리 납부하는 금액으로 렌트료 하향의 효과가 있습니다.",
      sortOrder: 2,
      isPublished: true,
    },
    {
      category: "신용/조건",
      question: "장기렌트를 이용하면 신용등급이 떨어지나요?",
      answer: "장기렌트는 대출 상품이 아니므로 개인의 신용등급이나 부채에 영향을 미치지 않습니다. 따라서 신용 관리에 매우 유리한 상품입니다.",
      sortOrder: 3,
      isPublished: true,
    },
    {
      category: "결제/영수증",
      question: "현금영수증 발행이 가능한가요?",
      answer: "국세청에서 정한 조세 특례 제한법 제126조 2항에 의거, 렌터카 비용은 소득 공제 대상에서 제외되어 현금영수증 발행이 불가능한 업종입니다. 단, 개인사업자와 법인사업자에 한해 세금계산서 발행이 가능합니다.",
      sortOrder: 4,
      isPublished: true,
    },
    {
      category: "서비스 이용",
      question: "차량 구매 과정은 어떻게 되나요?",
      answer: "홈페이지를 통해 상담신청을 남겨주시면 담당 매니저와 연결됩니다. 상담 후 최적의 견적을 확정하고 계약을 진행하시면 차량이 안전하게 인도됩니다.",
      sortOrder: 5,
      isPublished: true,
    },
    {
      category: "금융/계약",
      question: "차량 중도 해약 시, 위약금은 어떻게 계산되나요?",
      answer: "위약금은 [잔여렌탈료 X 위약금율]로 계산됩니다. (잔여렌탈료 = 월임대료(VAT미포함) / 30 X 미경과일수). 위약금율은 잔여 기간이 50% 이상일 경우 35%, 50% 미만일 경우 30%가 적용됩니다.",
      sortOrder: 6,
      isPublished: true,
    },
    {
      category: "제로카즈 특징",
      question: "왜 제로카즈 견적은 다른 곳보다 저렴한가요?",
      answer: "제로카즈는 영업 수수료 거품을 싹 뺀 정직한 견적만을 제안해 드리기 때문입니다. 불필요한 영업 마진을 제외하여 가장 합리적인 가격으로 차량을 이용하실 수 있습니다.",
      sortOrder: 0, // Put it at the top
      isPublished: true,
    },
    {
      category: "신용/조건",
      question: "개인회생 중인데 장기렌트가 가능한가요?",
      answer: "네, 가능합니다.\n\n일반적인 메이저 렌트카 회사에서는 불가하겠지만, 제로카즈의 '무심사 장기렌트' 상품을 통하면 가능합니다. 개인회생뿐만 아니라 신용불량, 연체, 파산 등 여러 사유로 메이저 업체 이용이 어려운 분들도 신용조회 없이 합리적인 조건으로 차량을 이용하실 수 있습니다.",
      sortOrder: 7,
      isPublished: true,
    },
    {
      category: "신용/조건",
      question: "신용불량자도 장기렌트카 이용이 정말 가능한가요?",
      answer: "네, 가능합니다.\n\n제로카즈는 신용 등급을 보지 않는 무심사 시스템을 운영하고 있어, 신용불량 고객님도 장기렌트 이용이 가능합니다. 일반 렌트사에서는 연체나 금융 기록 때문에 진행이 어렵지만, 제로카즈에서는 운전 가능한 조건만 충족된다면 대부분의 차종이 출고 가능합니다. (※ 단, 일부 고가 수입차나 고급 트림의 경우 소득 확인이 필요한 경우도 있습니다.)\n\n실제로도 신용불량, 개인회생, 신용회복 등으로 어려움을 겪는 상황에서 제로카즈를 통해 차량 출고에 성공하신 고객님들이 매우 많습니다.",
      sortOrder: 8,
      isPublished: true,
    },
    {
      category: "서비스 안내",
      question: "장기렌트/할부/리스의 차이점은 무엇인가요?",
      answer: "가장 큰 차이는 차량 소유주와 금융이력 변동입니다.\n\n• **장기렌트**: 차량 렌트사 소유, 금융이력 변동 없음, 초기비용 없음, 보험 렌트사 가입, 비용처리 가능\n• **할부**: 차량 본인 소유, 금융이력 변동(대출로 잡힘), 초기비용(취등록세 등) 발생, 보험 개별 가입\n• **리스**: 차량 리스사 소유, 금융이력 변동, 초기비용 없음, 보험 개별 가입, 비용처리 가능",
      sortOrder: 9,
      isPublished: true,
    },
    {
      category: "서비스 안내",
      question: "자차 면책금은 무엇인가요?",
      answer: "자동차 보험의 '자기차량손해'에 해당하는 것으로, 고객의 과실로 인해 차량이 손상되었을 때 일정 금액(면책금)만 지불하면 수리비 총액에 상관없이 사고를 처리할 수 있는 제도입니다. 수리비가 면책금 미만이면 실제 수리비만 부담하고, 면책금 이상이면 면책금만 납부하시면 됩니다.",
      sortOrder: 10,
      isPublished: true,
    },
    {
      category: "서비스 안내",
      question: "보험료와 부가세가 포함된 가격인가요?",
      answer: "네, 제로카즈에서 표기되는 모든 대여료는 부가세와 보험료가 모두 포함된 최종 금액입니다. 별도의 추가 비용 없이 안내된 금액 그대로 이용하실 수 있습니다.",
      sortOrder: 11,
      isPublished: true,
    },
    {
      category: "신용/조건",
      question: "운전자 자격 요건 또는 보험 적용 범위는 어떻게 되나요?",
      answer: "장기렌터카는 만 21세 이상으로 유효한 운전면허를 소지하고 있다면 누구나 계약 가능합니다.\n\n**보험 적용 범위:**\n• **개인**: 계약자 및 배우자, 직계가족, 형제자매\n• **개인사업자**: 계약자 및 배우자, 직계가족, 형제자매, 사업장 임직원\n\n※ 실운전자의 나이가 계약된 보험 연령(만 21세/26세)에 미달할 경우 보험료 및 대여료가 변동될 수 있습니다.",
      sortOrder: 12,
      isPublished: true,
    }
  ];

  for (const item of faqItems) {
    await prisma.faq.create({
      data: item,
    });
  }

  console.log("FAQ seeding completed!");
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
