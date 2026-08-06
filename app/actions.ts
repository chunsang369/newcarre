"use server";

import { prisma } from "@/lib/prisma";
import { expandSearchKeyword } from "@/lib/search-aliases";
import { resolveListPrices } from "@/lib/pricing";

function resolvePrice(car: any, brandName: string) {
  const { rent, lease } = resolveListPrices(car);

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
  try {
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

    if (popularCars && popularCars.length > 0) {
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
  } catch (e) {}

  // Fallback: Car 테이블의 isPopular: true 및 상위 활성 차량 직접 조회
  const fallbackCars = await prisma.car.findMany({
    where: {
      isActive: true,
      isPopular: true,
    },
    include: {
      brand: true,
    },
    orderBy: [
      { sortOrder: "asc" },
    ],
    take: limit || 30,
  });

  return fallbackCars.map((car, idx) => ({
    ...resolvePrice(car, car.brand.name),
    rank: idx + 1,
  }));
}

