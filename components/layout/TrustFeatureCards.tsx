const CARDS = [
  {
    title: "영업 수수료 ZERO",
    desc: "영업 수수료 거품을 싹뺀 견적으로 제안 해 드려요",
    bgImage: "/images/trust-consult-bg.png",
  },
  {
    title: "20개 금융사, 한눈에 비교",
    desc: "캐피탈사별 조건을 직접 발품 팔 필요 없어요\n최적의 금리를 찾아드립니다",
    bgImage: "/images/finance-card-bg.png",
  },
  {
    title: "기다림 없는 즉시 출고",
    desc: "월 2만 대 규모의 차량 풀에서 원하는 차를 바로 만나보세요",
    bgImage: "/images/cars-card-bg.png",
  },
  {
    title: "책임 보상제 시행",
    desc: "계약 내용과 약속된 조건을 그대로 보장해 드려요",
    bgImage: "/images/trust-shield-bg.png",
  },
];

export default function TrustFeatureCards() {
  return (
    <section className="py-12 lg:py-20 bg-[#f0f4f8]" aria-label="서비스 특장점">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8 space-y-6">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-3xl min-h-[200px] lg:min-h-[260px] shadow-sm group"
          >
            {/* 배경 이미지 (오른쪽 위주) */}
            <img
              src={card.bgImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              draggable={false}
            />

            {/* 좌측 텍스트 가독성을 위한 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#e4eaf0]/95 via-[#e4eaf0]/80 to-transparent" />

            {/* 텍스트 콘텐츠 (좌측 정렬) */}
            <div className="relative z-10 flex flex-col justify-center h-full p-8 lg:p-12 max-w-[60%] lg:max-w-[50%]">
              <h3 className="text-gray-900 text-xl lg:text-2xl font-bold mb-2 leading-tight">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm lg:text-base leading-relaxed whitespace-pre-line">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
