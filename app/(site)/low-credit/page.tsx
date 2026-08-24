import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { resolveLowCreditMonthlyRent } from "@/lib/pricing";
import HeroPromoBanner from "@/components/layout/HeroPromoBanner";
import JetcarCarCatalog from "@/components/cars/JetcarCarCatalog";
import QuickQuoteForm from "@/components/form/QuickQuoteForm";

export const metadata: Metadata = {
  title: "신차장기렌트 · 무심사 · 저신용 | 제로카즈",
  description:
    "누구나 비대면 무심사 신차장기렌트. 신용등급 무관, 빠른 출고 가능한 신차 라인업을 확인해보세요.",
};

export const revalidate = 60;

export default async function LowCreditPage() {
  const rawCars = await prisma.car.findMany({
    where: { isActive: true },
    include: {
      brand: true,
    },
    orderBy: [
      { isPopular: "desc" },
      { sortOrder: "asc" },
      { brand: { sortOrder: "asc" } },
    ],
  });

  const cars = rawCars.map((car) => {
    const rent = resolveLowCreditMonthlyRent(car);
    return {
      id: car.id,
      slug: car.slug,
      brandSlug: car.brand.slug,
      brandName: car.brand.name,
      modelName: car.modelName,
      trimName: car.trimName,
      year: car.year,
      fuelType: car.fuelType,
      category: car.category,
      monthlyRent: rent,
      thumbnailUrl: car.thumbnailUrl || "/hero/hero-bg.jpg",
    };
  });

  return (
    <div className="min-h-screen bg-[#f4f7fa] pt-14 lg:pt-16">
      {/* 1. 상단 제트카 스타일 신차장기렌트 배너 */}
      <HeroPromoBanner />

      {/* 2. 제트카 스타일 브랜드 셀렉터 + 상세 필터 + 차량 리스트 */}
      <JetcarCarCatalog initialCars={cars} />

      {/* 3. 하단 빠른 견적 및 상담신청 */}
      <div className="border-t border-gray-100 bg-white">
        <QuickQuoteForm />
      </div>
    </div>
  );
}
