"use server";

import { withRetry } from "@/lib/prisma";
import { expandSearchKeyword } from "@/lib/search-aliases";

export async function getCarsByBrand(slug: string, limit?: number, skip?: number) {
  return withRetry(async (prisma) => {
    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        cars: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          take: limit,
          skip: skip,
        },
      },
    });

    if (!brand) return [];

    return brand.cars.map((car) => {
      const matrix = car.priceMatrix as Record<string, { rent: number; lease: number }>;
      const baseKey = "36_PREPAY_30_20000";
      let rent = matrix?.[baseKey]?.rent || 0;
      let lease = matrix?.[baseKey]?.lease || 0;

      // 2024-05-13: 캐스퍼 일렉트릭 보조금 및 최신 가격 로직 반영
      const isCasperElectric = car.slug === "hyundai-casper-electric";
      const subsidyFactor = isCasperElectric ? 0.298 : 1.0;

      // Direct Chasalddae keys or numbers fallback
      if (!rent || rent === 0 || rent < 50000) { // 너무 낮은 금액은 오데이터로 간주
        rent = matrix?.["0_36_20000"]?.rent || matrix?.["30_36_20000"]?.rent || Math.round(car.basePrice * 0.0165 * subsidyFactor);
      }
      if (!lease || lease === 0 || lease < 50000) {
        lease = matrix?.["0_36_20000"]?.lease || matrix?.["30_36_20000"]?.lease || Math.round(car.basePrice * 0.0135 * subsidyFactor);
      }

      return {
        id: car.id,
        slug: car.slug,
        brandName: brand.name,
        modelName: car.modelName,
        trimName: car.trimName,
        year: car.year,
        category: car.category,
        fuelType: car.fuelType,
        monthlyRent: rent,
        monthlyLease: lease,
        basePrice: car.basePrice,
        thumbnailUrl: car.thumbnailUrl,
      };
    });
  });
}

export async function getCarsByTab(isDomestic: boolean, limit?: number, skip?: number) {
  return withRetry(async (prisma) => {
    const cars = await prisma.car.findMany({
      where: {
        isActive: true,
        brand: {
          isDomestic: isDomestic,
        },
      },
      include: {
        brand: true,
      },
      orderBy: [
        { brand: { sortOrder: "asc" } },
        { sortOrder: "asc" }
      ],
      take: limit,
      skip: skip,
    });

    return cars.map((car) => {
      const matrix = car.priceMatrix as Record<string, { rent: number; lease: number }>;
      const baseKey = "36_PREPAY_30_20000";
      let rent = matrix?.[baseKey]?.rent || 0;
      let lease = matrix?.[baseKey]?.lease || 0;

      // 2024-05-13: 캐스퍼 일렉트릭 보조금 및 최신 가격 로직 반영
      const isCasperElectric = car.slug === "hyundai-casper-electric";
      const subsidyFactor = isCasperElectric ? 0.298 : 1.0;

      if (!rent || rent === 0 || rent < 50000) {
        rent = matrix?.["0_36_20000"]?.rent || matrix?.["30_36_20000"]?.rent || Math.round(car.basePrice * 0.0165 * subsidyFactor);
      }
      if (!lease || lease === 0 || lease < 50000) {
        lease = matrix?.["0_36_20000"]?.lease || matrix?.["30_36_20000"]?.lease || Math.round(car.basePrice * 0.0135 * subsidyFactor);
      }

      return {
        id: car.id,
        slug: car.slug,
        brandName: car.brand.name,
        modelName: car.modelName,
        trimName: car.trimName,
        year: car.year,
        category: car.category,
        fuelType: car.fuelType,
        monthlyRent: rent,
        monthlyLease: lease,
        basePrice: car.basePrice,
        thumbnailUrl: car.thumbnailUrl,
      };
    });
  });
}

export async function searchCars(keyword: string) {
  const expandedKeywords = expandSearchKeyword(keyword);

  return withRetry(async (prisma) => {
    const orConditions = expandedKeywords.flatMap((kw) => [
      { modelName: { contains: kw, mode: "insensitive" as const } },
      { trimName: { contains: kw, mode: "insensitive" as const } },
      { brand: { name: { contains: kw, mode: "insensitive" as const } } },
    ]);

    const cars = await prisma.car.findMany({
      where: {
        isActive: true,
        OR: orConditions,
      },
      include: {
        brand: true,
      },
      orderBy: [
        { brand: { sortOrder: "asc" } },
        { sortOrder: "asc" },
      ],
    });

    return cars.map((car) => {
      const matrix = car.priceMatrix as Record<string, { rent: number; lease: number }>;
      const baseKey = "36_PREPAY_30_20000";
      let rent = matrix?.[baseKey]?.rent || 0;
      let lease = matrix?.[baseKey]?.lease || 0;

      const isCasperElectric = car.slug === "hyundai-casper-electric";
      const subsidyFactor = isCasperElectric ? 0.298 : 1.0;

      if (!rent || rent === 0 || rent < 50000) {
        rent = matrix?.["0_36_20000"]?.rent || matrix?.["30_36_20000"]?.rent || Math.round(car.basePrice * 0.0165 * subsidyFactor);
      }
      if (!lease || lease === 0 || lease < 50000) {
        lease = matrix?.["0_36_20000"]?.lease || matrix?.["30_36_20000"]?.lease || Math.round(car.basePrice * 0.0135 * subsidyFactor);
      }

      return {
        id: car.id,
        slug: car.slug,
        brandName: car.brand.name,
        modelName: car.modelName,
        trimName: car.trimName,
        year: car.year,
        category: car.category,
        fuelType: car.fuelType,
        monthlyRent: rent,
        monthlyLease: lease,
        basePrice: car.basePrice,
        thumbnailUrl: car.thumbnailUrl,
      };
    });
  });
}
