"use server";

import { prisma } from "@/lib/prisma";
import { expandSearchKeyword } from "@/lib/search-aliases";

function resolvePrice(car: any, brandName: string) {
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
    brandName,
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
}

export async function getCarsByBrand(slug: string, limit?: number, skip?: number) {
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
  return brand.cars.map((car) => resolvePrice(car, brand.name));
}

export async function getCarsByTab(isDomestic: boolean, limit?: number, skip?: number) {
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

  return cars.map((car) => resolvePrice(car, car.brand.name));
}

export async function searchCars(keyword: string) {
  const expandedKeywords = expandSearchKeyword(keyword);

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

  return cars.map((car) => resolvePrice(car, car.brand.name));
}

export async function getPopularCars(limit?: number) {
  const popularCars = await prisma.popularCar.findMany({
    include: {
      car: {
        include: {
          brand: true,
        },
      },
    },
    orderBy: {
      rank: "asc",
    },
    take: limit,
  });

  return popularCars
    .filter((pc) => pc.car && pc.car.isActive)
    .map((pc) => {
      const resolved = resolvePrice(pc.car, pc.car.brand.name);
      return {
        ...resolved,
        rank: pc.rank,
        salesCount: pc.salesCount,
        change: pc.change,
      };
    });
}

