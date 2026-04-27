"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronRight, Car } from "lucide-react";

interface Review {
  id: string;
  type: "렌트" | "리스";
  brand: string;
  model: string;
  title: string;
  excerpt: string;
  condition: string;
}

const REVIEWS: Review[] = [
  {
    id: "r1",
    type: "렌트",
    brand: "기아",
    model: "카니발",
    title: "[기아]카니발 출고후기",
    excerpt: "카니발은 출고하고 나서부터 \"차가 커지면 일정이 쉬워진다\"는 걸 체감 중이에요. 인원 많아도 자리 걱정 없고...",
    condition: "40대 개인고객ㅣ렌트ㅣ선납10%ㅣ60개월",
  },
  {
    id: "r2",
    type: "렌트",
    brand: "현대",
    model: "팰리세이드",
    title: "[현대]팰리세이드 출고후기",
    excerpt: "팰리세이드는 확실히 \"공간에서 오는 여유\"가 다르네요. 가족이 다 같이 타도 답답함이 없고...",
    condition: "40대 개인고객ㅣ렌트ㅣ보증금20%ㅣ60개월",
  },
  {
    id: "r3",
    type: "렌트",
    brand: "제네시스",
    model: "G80",
    title: "[제네시스]G80 출고후기",
    excerpt: "G80은 출고하고 나서부터 \"차가 조용하면 대화도 편해진다\"는 걸 느끼고 있어요...",
    condition: "40대 개인고객ㅣ렌트ㅣ보증금20%ㅣ48개월",
  },
  {
    id: "r4",
    type: "렌트",
    brand: "기아",
    model: "셀토스",
    title: "[기아]셀토스 출고후기",
    excerpt: "셀토스는 \"SUV 입문용\"으로 왜 많이들 추천하는지 바로 알겠더라고요. 크기는 부담 없는데...",
    condition: "30대 개인고객ㅣ렌트ㅣ선납10%ㅣ48개월",
  },
  {
    id: "r5",
    type: "렌트",
    brand: "기아",
    model: "EV6",
    title: "[기아]EV6 출고후기",
    excerpt: "EV6는 출고하고 나서 \"전기차가 왜 편하다는지\" 바로 느꼈어요. 조용하고 가속이 부드러워서...",
    condition: "30대 개인고객ㅣ렌트ㅣ보증금20%ㅣ48개월",
  },
  {
    id: "r6",
    type: "렌트",
    brand: "기아",
    model: "K5",
    title: "[기아]K5 출고후기",
    excerpt: "K5는 딱 \"데일리로 타기 좋은 감각\"이 있어요. 출고 받고 며칠 타보니 조작이 편하고...",
    condition: "30대 개인고객ㅣ렌트ㅣ무보증ㅣ48개월",
  },
];

export default function ReviewCarousel() {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });

  return (
    <section className="py-8 bg-white" aria-label="이용후기">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
            하이카즈 이용후기
          </h2>
          <Link
            href="/reviews"
            className="flex items-center gap-0.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            전체보기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 캐러셀 */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {REVIEWS.map((review) => (
              <div
                key={review.id}
                className="flex-[0_0_75%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0"
              >
                <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                  {/* 상단: 타입 배지 + 이미지 */}
                  <div className="relative">
                    <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-[#0a2540] text-white text-[10px] font-bold rounded">
                      {review.type}
                    </span>
                    <div className="aspect-[16/10] bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center">
                      <Car className="w-12 h-12 text-gray-300" />
                    </div>
                  </div>

                  {/* 하단: 텍스트 */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {review.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2 flex-1 line-clamp-3 leading-relaxed">
                      출고차량 및 조건 {review.condition}
                      <br />
                      {review.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
