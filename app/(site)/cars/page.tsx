export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import CarsListClient from "./CarsListClient";

export const metadata: Metadata = {
  title: "전체 차량 목록 — 하이카즈 장기렌트·리스",
  description:
    "국산·수입차 전 모델 장기렌트·리스 최저가 견적을 비교하세요. 브랜드, 차종, 연료, 가격대별 필터 지원.",
};

export default async function CarsPage() {
  const cars = await prisma.car.findMany({
    where: { isActive: true },
    include: { brand: true },
    orderBy: { sortOrder: "asc" },
  });

  const brands = await prisma.brand.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const serializedCars = cars.map((c) => ({
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

  const serializedBrands = brands.map((b) => ({
    slug: b.slug,
    name: b.name,
    isDomestic: b.isDomestic,
  }));

  return <CarsListClient cars={serializedCars} brands={serializedBrands} />;
}
