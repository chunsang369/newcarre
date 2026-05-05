"use server";

import { withRetry } from "@/lib/prisma";

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

      // Direct Chasalddae keys or numbers fallback
      if (!rent || rent === 0) {
        rent = matrix?.["0_36_20000"]?.rent || matrix?.["30_36_20000"]?.rent || Math.round(car.basePrice * 0.0125);
      }
      if (!lease || lease === 0) {
        lease = matrix?.["0_36_20000"]?.lease || matrix?.["30_36_20000"]?.lease || Math.round(car.basePrice * 0.0115);
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

      if (!rent || rent === 0) {
        rent = matrix?.["0_36_20000"]?.rent || matrix?.["30_36_20000"]?.rent || Math.round(car.basePrice * 0.0125);
      }
      if (!lease || lease === 0) {
        lease = matrix?.["0_36_20000"]?.lease || matrix?.["30_36_20000"]?.lease || Math.round(car.basePrice * 0.0115);
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
