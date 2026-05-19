export const revalidate = 1800;

import type { Metadata } from "next";
import CarsListClient from "./CarsListClient";
import { getCachedCars, getCachedBrands } from "@/lib/cache";

export const metadata: Metadata = {
  title: "전체 차량 목록 — 하이카즈 장기렌트·리스",
  description:
    "국산·수입차 전 모델 장기렌트·리스 최저가 견적을 비교하세요. 브랜드, 차종, 연료, 가격대별 필터 지원.",
};

export default async function CarsPage() {
  const cars = await getCachedCars();
  const brands = await getCachedBrands();

  const serializedCars = cars.map((c: any) => ({
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
      isDomestic: c.brand.isDomestic,
    },
  }));

  const serializedBrands = brands.map((b: any) => ({
    slug: b.slug,
    name: b.name,
    isDomestic: b.isDomestic,
  }));

  return <CarsListClient cars={serializedCars} brands={serializedBrands} />;
}
