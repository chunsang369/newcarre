export const dynamic = "force-dynamic";

import HeroMain from "@/components/layout/HeroMain";
import BrandGrid from "@/components/cars/BrandGrid";
import TrustFeatureCards from "@/components/layout/TrustFeatureCards";
import ServiceTrust from "@/components/layout/ServiceTrust";
import CTABanners from "@/components/layout/CTABanners";
import QuickQuoteForm from "@/components/form/QuickQuoteForm";
import PriceRangeSearch from "@/components/cars/PriceRangeSearch";
import BestPlanners from "@/components/planners/BestPlanners";
import ReviewCarousel from "@/components/reviews/ReviewCarousel";
import FaqAccordion from "@/components/faq/FaqAccordion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Visual Section */}
      <HeroMain 
        backgroundImage="/hero/hero-bg.jpg" 
        backgroundVideo="/hero/luxury-hero.mp4" 
      />

      {/* 2. 관심 차종 선택 (브랜드 그리드) */}
      <BrandGrid />

      {/* 3. 토스 스타일 핵심 특징 카드 */}
      <TrustFeatureCards />

      {/* 4. 신뢰 지표 섹션 */}
      <ServiceTrust />

      {/* 5. 금액대별 차량 검색 */}
      <PriceRangeSearch />

      {/* 6. 중간 CTA 배너 */}
      <CTABanners />

      {/* 7. 베스트 플래너 */}
      <BestPlanners />

      {/* 8. 하이카즈 이용후기 */}
      <ReviewCarousel />

      {/* 9. 자주 묻는 질문 (FAQ) */}
      <FaqAccordion />

      {/* 10. 하단 간편 상담신청 */}
      <QuickQuoteForm />

      {/* 하단 FloatingCTA 높이 보정 (모바일) */}
      <div className="h-16 lg:h-0" />
    </div>
  );
}
