export const dynamic = "force-dynamic";

import HeroSlider from "@/components/layout/HeroSlider";
import BrandGrid from "@/components/cars/BrandGrid";
import CTABanners from "@/components/layout/CTABanners";
import QuickQuoteForm from "@/components/form/QuickQuoteForm";
import PriceRangeSearch from "@/components/cars/PriceRangeSearch";
import BestPlanners from "@/components/planners/BestPlanners";
import ReviewCarousel from "@/components/reviews/ReviewCarousel";
import FaqAccordion from "@/components/faq/FaqAccordion";
import ConsultChannel from "@/components/layout/ConsultChannel";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Visual Slider */}
      <HeroSlider />

      {/* 2. 관심 차종 선택 (브랜드 그리드) */}
      <BrandGrid />

      {/* 5. CTA 배너 3종 */}
      <CTABanners />

      {/* 7. 이달의 BEST 플래너 */}
      <BestPlanners />

      {/* 8. 하이카즈 이용후기 */}
      <ReviewCarousel />

      {/* 9. FAQ */}
      <FaqAccordion />

      {/* 10. 고객센터 상담 채널 */}
      <ConsultChannel />

      {/* 11. 하단 간편 상담신청 (반복) */}
      <QuickQuoteForm />

      {/* 하단 FloatingCTA 높이 보정 (모바일) */}
      <div className="h-16 lg:h-0" />
    </div>
  );
}
