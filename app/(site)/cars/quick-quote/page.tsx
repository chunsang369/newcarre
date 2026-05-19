export const dynamic = "force-static";

import BrandGrid from "@/components/cars/BrandGrid";
import QuickQuoteForm from "@/components/form/QuickQuoteForm";

export const metadata = {
  title: "빠른 간편견적 — 하이카즈",
  description:
    "원하는 차량의 견적을 확실하고 빠르게 확인하실 수 있습니다. 브랜드별 차량 선택 후 간편하게 견적을 신청하세요.",
};

export default function QuickQuotePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 타이틀 */}
      <section className="pt-10 pb-6 lg:pt-16 lg:pb-10 bg-gradient-to-b from-[#0a2540] to-[#143a66] text-center">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            빠른 간편견적
          </h1>
          <p className="text-sm lg:text-base text-white/70">
            원하는 차량의 견적을 확실하고 빠르게 확인하실 수 있습니다.
          </p>
        </div>
      </section>

      {/* 차량 선택 (BrandGrid) */}
      <BrandGrid />

      {/* 간편견적문의 폼 */}
      <QuickQuoteForm />

      {/* 하단 FloatingCTA 높이 보정 (모바일) */}
      <div className="h-16 lg:h-0" />
    </div>
  );
}
