"use server";

import { prisma } from "@/lib/prisma";

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

  return brand.cars.map((car) => {
    const matrix = car.priceMatrix as Record<string, { rent: number; lease: number }>;
    const baseKey = "36_PREPAY_30_20000";
    const price = matrix?.[baseKey] || { rent: 0, lease: 0 };

    return {
      id: car.id,
      slug: car.slug,
      brandName: brand.name,
      modelName: car.modelName,
      trimName: car.trimName,
      year: car.year,
      category: car.category,
      fuelType: car.fuelType,
      monthlyRent: price.rent,
      monthlyLease: price.lease,
      thumbnailUrl: car.thumbnailUrl,
    };
  });
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

  return cars.map((car) => {
    const matrix = car.priceMatrix as Record<string, { rent: number; lease: number }>;
    const baseKey = "36_PREPAY_30_20000";
    const price = matrix?.[baseKey] || { rent: 0, lease: 0 };

    return {
      id: car.id,
      slug: car.slug,
      brandName: car.brand.name,
      modelName: car.modelName,
      trimName: car.trimName,
      year: car.year,
      category: car.category,
      fuelType: car.fuelType,
      monthlyRent: price.rent,
      monthlyLease: price.lease,
      thumbnailUrl: car.thumbnailUrl,
    };
  });
}
