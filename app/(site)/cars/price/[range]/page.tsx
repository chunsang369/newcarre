export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PriceRangeClient from "./PriceRangeClient";

export async function generateMetadata({ params }: { params: Promise<{ range: string }> }): Promise<Metadata> {
  const { range } = await params;
  const rangeNum = parseInt(range);
  if (isNaN(rangeNum)) return { title: "가격대별 차량 — 하이카즈" };

  return {
    title: `${rangeNum}만원대 추천 차량 — 하이카즈`,
    description: `월 ${rangeNum}만원대로 이용 가능한 최적의 장기렌트·리스 차량 리스트입니다.`,
  };
}

export default async function PriceRangePage({ params }: { params: Promise<{ range: string }> }) {
  const { range } = await params;
  const rangeNum = parseInt(range);

  if (isNaN(rangeNum)) notFound();

  const minPrice = rangeNum * 10000;
  const maxPrice = (rangeNum + 10) * 10000 - 1; // 30만원대면 300,000 ~ 399,999

  // 모든 활성 차량을 가져와서 서버에서 필터링 (JSON 컬럼 검색 최적화 대신 전체 조회 후 처리)
  const allCars = await prisma.car.findMany({
    where: { isActive: true },
    include: { brand: true },
    orderBy: { sortOrder: "asc" },
  });

  const filteredCars = allCars.filter((car) => {
    const pm = car.priceMatrix as Record<string, { rent: number; lease: number }>;
    const rent = pm["36_PREPAY_30_20000"]?.rent || 0;
    return rent >= minPrice && rent <= maxPrice;
  });

  const serializedCars = filteredCars.map((c) => ({
    id: c.id,
    slug: c.slug,
    modelName: c.modelName,
    trimName: c.trimName,
    year: c.year,
    category: c.category,
    fuelType: c.fuelType,
    basePrice: c.basePrice,
    thumbnailUrl: c.thumbnailUrl,
    isPopular: c.isPopular,
    isInstant: c.isInstant,
    priceMatrix: c.priceMatrix as Record<string, { rent: number; lease: number }>,
    brand: {
      name: c.brand.name,
      slug: c.brand.slug,
    },
  }));

  return <PriceRangeClient range={rangeNum} cars={serializedCars} />;
}
