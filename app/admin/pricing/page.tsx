export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { popularCars } from "@/prisma/car-data";
import AdminPricingClient from "./AdminPricingClient";

// prisma/seed.ts의 generatePriceMatrix 구조를 재사용하여 원본 가격 매트릭스를 온전히 생성
function generatePriceMatrixHelper(scrapedMatrix: any) {
  const periods = [36, 48, 60];
  const deposits = ['PREPAY_30', 'DEPOSIT_30', 'NO_DEPOSIT'];
  const mileages = [10000, 20000, 30000];

  const periodFactor = { 36: 1.0, 48: 0.82, 60: 0.70 };
  const mileageFactor = { 10000: 0.92, 20000: 1.0, 30000: 1.12 };

  const depositKeys: Record<string, string> = {
    PREPAY_30: 'prepay',
    DEPOSIT_30: 'deposit',
    NO_DEPOSIT: 'none',
  };

  const matrix: Record<string, { rent: number; lease: number }> = {};

  for (const p of periods) {
    for (const d of deposits) {
      for (const m of mileages) {
        const key = `${p}_${d}_${m}`;
        const dKey = depositKeys[d];
        
        const baseRent = scrapedMatrix?.rent?.[dKey] || 0;
        const baseLease = scrapedMatrix?.lease?.[dKey] || 0;

        const factor =
          periodFactor[p as 36 | 48 | 60] *
          mileageFactor[m as 10000 | 20000 | 30000];
          
        matrix[key] = {
          rent: Math.round(baseRent * factor),
          lease: Math.round(baseLease * factor),
        };
      }
    }
  }
  return matrix;
}

export default async function AdminPricingPage() {
  const cars = await prisma.car.findMany({
    include: { brand: true },
    orderBy: { sortOrder: "asc" },
  });

  const brands = await prisma.brand.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <AdminPricingClient
      initialCars={cars.map((car) => {
        // 원본 popularCars에서 최초 설정 요금을 조회하여 매핑
        const originalCar = popularCars.find((c) => c.slug === car.slug);
        let originalPriceMatrix = originalCar?.priceMatrix || {};
        
        // 원본 포맷이 scraped 형식인 경우 보정
        if (originalPriceMatrix && typeof (originalPriceMatrix as any).rent === 'object') {
          originalPriceMatrix = generatePriceMatrixHelper(originalPriceMatrix);
        }

        return {
          id: car.id,
          slug: car.slug,
          brand: {
            id: car.brand.id,
            name: car.brand.name,
          },
          modelName: car.modelName,
          trimName: car.trimName,
          year: car.year,
          basePrice: car.basePrice,
          thumbnailUrl: car.thumbnailUrl,
          priceMatrix: car.priceMatrix,
          originalPriceMatrix: originalPriceMatrix, // 원본 가격 정보 추가 전달
        };
      })}
      brands={brands.map((b) => ({
        id: b.id,
        name: b.name,
      }))}
    />
  );
}
