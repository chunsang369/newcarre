export const revalidate = 1800;

import { Suspense } from "react";
import HeroMain from "@/components/layout/HeroMain";
import BrandGrid from "@/components/cars/BrandGrid";
import TrustFeatureCards from "@/components/layout/TrustFeatureCards";
import QuickQuoteForm from "@/components/form/QuickQuoteForm";
import ReviewCarousel from "@/components/reviews/ReviewCarousel";
import FaqAccordion from "@/components/faq/FaqAccordion";
import ReviewCarouselSkeleton from "@/components/reviews/ReviewCarouselSkeleton";
import FaqSkeleton from "@/components/faq/FaqSkeleton";

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

      {/* 8. 하이카즈 이용후기 */}
      <Suspense fallback={<ReviewCarouselSkeleton />}>
        <ReviewCarousel />
      </Suspense>

      {/* 9. 자주 묻는 질문 (FAQ) */}
      <Suspense fallback={<FaqSkeleton />}>
        <FaqAccordion />
      </Suspense>

      {/* 10. 하단 간편 상담신청 */}
      <QuickQuoteForm />

      {/* 하단 FloatingCTA 높이 보정 (모바일) */}
      <div className="h-16 lg:h-0" />
    </div>
  );
}
