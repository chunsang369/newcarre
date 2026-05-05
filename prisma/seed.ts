/**
 * Prisma Seed Data
 *
 * 데이터 출처: m.hicarzautoplan.com 공개 차량 정보 (사실 정보, 저작권 無)
 * 기준 조건: 36개월 / 선납 30% / 만 26세 이상 / 연 2만km
 *
 * 주의:
 * - 월납입료는 업계 통용 시세이며, 실제 계약 시 고객 신용도/금리/프로모션에 따라 변동
 * - 차량 썸네일 이미지는 반드시 제조사 프레스킷 또는 자체 촬영 사용 (원본 사이트 이미지 URL 직접 참조 금지)
 *
 * 사용법:
 *   npx prisma db seed
 *
 * package.json에 추가:
 *   "prisma": { "seed": "tsx prisma/seed.ts" }
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// 1. BRANDS (국산 6 + 수입 32)
// ============================================================
const brands = [
  // 국산
  { slug: 'hyundai', name: '현대', nameEn: 'Hyundai', isDomestic: true, sortOrder: 1 },
  { slug: 'kia', name: '기아', nameEn: 'Kia', isDomestic: true, sortOrder: 2 },
  { slug: 'genesis', name: '제네시스', nameEn: 'Genesis', isDomestic: true, sortOrder: 3 },
  { slug: 'renault-korea', name: '르노코리아', nameEn: 'Renault Korea', isDomestic: true, sortOrder: 4 },
  { slug: 'chevrolet', name: '쉐보레', nameEn: 'Chevrolet', isDomestic: true, sortOrder: 5 },
  { slug: 'kgm', name: 'KGM', nameEn: 'KGM', isDomestic: true, sortOrder: 6 },

  // 수입
  { slug: 'bmw', name: 'BMW', nameEn: 'BMW', isDomestic: false, sortOrder: 10 },
  { slug: 'mercedes-benz', name: '벤츠', nameEn: 'Mercedes-Benz', isDomestic: false, sortOrder: 11 },
  { slug: 'audi', name: '아우디', nameEn: 'Audi', isDomestic: false, sortOrder: 12 },
  { slug: 'mini', name: '미니', nameEn: 'MINI', isDomestic: false, sortOrder: 13 },
  { slug: 'volvo', name: '볼보', nameEn: 'Volvo', isDomestic: false, sortOrder: 14 },
  { slug: 'volkswagen', name: '폭스바겐', nameEn: 'Volkswagen', isDomestic: false, sortOrder: 15 },
  { slug: 'toyota', name: '토요타', nameEn: 'Toyota', isDomestic: false, sortOrder: 16 },
  { slug: 'lexus', name: '렉서스', nameEn: 'Lexus', isDomestic: false, sortOrder: 17 },
  { slug: 'honda', name: '혼다', nameEn: 'Honda', isDomestic: false, sortOrder: 18 },
  { slug: 'land-rover', name: '랜드로버', nameEn: 'Land Rover', isDomestic: false, sortOrder: 19 },
  { slug: 'jaguar', name: '재규어', nameEn: 'Jaguar', isDomestic: false, sortOrder: 20 },
  { slug: 'ford', name: '포드', nameEn: 'Ford', isDomestic: false, sortOrder: 21 },
  { slug: 'lincoln', name: '링컨', nameEn: 'Lincoln', isDomestic: false, sortOrder: 22 },
  { slug: 'jeep', name: '지프', nameEn: 'Jeep', isDomestic: false, sortOrder: 23 },
  { slug: 'gmc', name: 'GMC', nameEn: 'GMC', isDomestic: false, sortOrder: 24 },
  { slug: 'cadillac', name: '캐딜락', nameEn: 'Cadillac', isDomestic: false, sortOrder: 25 },
  { slug: 'peugeot', name: '푸조', nameEn: 'Peugeot', isDomestic: false, sortOrder: 26 },
  { slug: 'tesla', name: '테슬라', nameEn: 'Tesla', isDomestic: false, sortOrder: 27 },
  { slug: 'ds', name: 'DS', nameEn: 'DS', isDomestic: false, sortOrder: 28 },
  { slug: 'polestar', name: '폴스타', nameEn: 'Polestar', isDomestic: false, sortOrder: 29 },
  { slug: 'lucid', name: '루시드', nameEn: 'Lucid', isDomestic: false, sortOrder: 30 },
  { slug: 'lotus', name: '로터스', nameEn: 'Lotus', isDomestic: false, sortOrder: 31 },
  { slug: 'maserati', name: '마세라티', nameEn: 'Maserati', isDomestic: false, sortOrder: 32 },
  { slug: 'porsche', name: '포르쉐', nameEn: 'Porsche', isDomestic: false, sortOrder: 33 },
  { slug: 'bentley', name: '벤틀리', nameEn: 'Bentley', isDomestic: false, sortOrder: 34 },
  { slug: 'ferrari', name: '페라리', nameEn: 'Ferrari', isDomestic: false, sortOrder: 35 },
  { slug: 'lamborghini', name: '람보르기니', nameEn: 'Lamborghini', isDomestic: false, sortOrder: 36 },
  { slug: 'aston-martin', name: '애스턴마틴', nameEn: 'Aston Martin', isDomestic: false, sortOrder: 37 },
  { slug: 'mclaren', name: '맥라렌', nameEn: 'McLaren', isDomestic: false, sortOrder: 38 },
  { slug: 'rolls-royce', name: '롤스로이스', nameEn: 'Rolls-Royce', isDomestic: false, sortOrder: 39 },
  { slug: 'ineos', name: '이네오스', nameEn: 'Ineos', isDomestic: false, sortOrder: 40 },
  { slug: 'byd', name: 'BYD', nameEn: 'BYD', isDomestic: false, sortOrder: 41 },
];

// ============================================================
// 2. POPULAR CARS — 별도 파일에서 import (65+ 차량)
// ============================================================
import { popularCars } from './car-data';


// ============================================================
// 3. PRICE MATRIX 생성 헬퍼
// ============================================================
/**
 * 기간/선납/연주행 조합별 월납입료 매트릭스 생성
 * 실제 운영 시에는 금융사/리스사 제공 값으로 교체 필요
 *
 * 계수 로직 (임시):
 * - 기간: 36m 기준 1.0, 48m 0.82, 60m 0.70
 * - 주행: 2만km 기준 1.0, 1만km 0.92, 3만km 1.12
 * - 선납: 크롤링된 실제 데이터(prepay, deposit, none) 사용 (1:1 정확하게)
 */
function generatePriceMatrix(scrapedMatrix: any) {
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

// ============================================================
// 4. SEED EXECUTION
// ============================================================
async function main() {
  console.log('🌱 Seeding database...');

  // Brands
  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: brand,
      create: {
        ...brand,
        logoUrl: `/images/brands/${brand.slug}.png`, // 실제 로고는 별도 준비
      },
    });
  }
  console.log(`✅ ${brands.length} brands seeded`);

  // Cars
  for (const car of popularCars) {
    const brand = await prisma.brand.findUnique({ where: { slug: car.brandSlug } });
    if (!brand) continue;

    let priceMatrix = car.priceMatrix as any;
    // Fallback for old format
    if (priceMatrix && typeof (priceMatrix as any).rent === 'object') {
        priceMatrix = generatePriceMatrix(car.priceMatrix as any);
    }

    await prisma.car.upsert({
      where: { slug: car.slug },
      update: {
        brandId: brand.id,
        modelName: car.modelName,
        trimName: car.trimName,
        year: car.year,
        category: car.category,
        fuelType: car.fuelType,
        basePrice: car.basePrice,
        priceMatrix,
        isPopular: car.isPopular,
        sortOrder: car.sortOrder,
        options: car.options || {},
        thumbnailUrl: car.imageUrl || `/images/cars/${car.slug}.png`,
      },
      create: {
        slug: car.slug,
        brandId: brand.id,
        modelName: car.modelName,
        trimName: car.trimName,
        year: car.year,
        category: car.category,
        fuelType: car.fuelType,
        basePrice: car.basePrice,
        thumbnailUrl: car.imageUrl || `/images/cars/${car.slug}.png`,
        galleryUrls: [],
        options: car.options || {},
        priceMatrix,
        isPopular: car.isPopular,
        sortOrder: car.sortOrder,
      },
    });
  }
  console.log(`✅ ${popularCars.length} cars seeded`);

  console.log('🎉 Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
