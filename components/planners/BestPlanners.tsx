"use client";

import useEmblaCarousel from "embla-carousel-react";
import { User, ChevronRight } from "lucide-react";

const PLANNERS = [
  { id: 1, name: "박민희", title: "팀장", motto: "최적의 조건을 찾아드립니다", contracts: 1250 },
  { id: 2, name: "김현지", title: "선임매니저", motto: "합리적인 가격, 확실한 서비스", contracts: 980 },
  { id: 3, name: "이서준", title: "수석매니저", motto: "고객 만족이 최우선입니다", contracts: 870 },
  { id: 4, name: "정다은", title: "매니저", motto: "친절한 상담 도와드리겠습니다", contracts: 760 },
  { id: 5, name: "최우진", title: "선임매니저", motto: "빠른 출고, 정확한 견적", contracts: 920 },
  { id: 6, name: "한소영", title: "매니저", motto: "전문적인 상담을 약속합니다", contracts: 650 },
];

export default function BestPlanners() {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });

  return (
    <section className="py-8 bg-white" aria-label="이달의 BEST 플래너">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-5">
          이달의 BEST 플래너
        </h2>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {PLANNERS.map((planner) => (
              <div
                key={planner.id}
                className="flex-[0_0_42%] md:flex-[0_0_30%] lg:flex-[0_0_22%] min-w-0"
              >
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                  {/* 프로필 아바타 */}
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>

                  {/* 이름/직급 */}
                  <p className="text-sm font-bold text-gray-900">{planner.name}</p>
                  <p className="text-xs text-gray-400 mb-1">{planner.title}</p>
                  <p className="text-[11px] text-gray-500 mb-3 line-clamp-1">
                    {planner.motto}
                  </p>

                  {/* 상담신청 */}
                  <button
                    className="w-full flex items-center justify-center gap-0.5 py-2 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    상담신청 바로하기
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
