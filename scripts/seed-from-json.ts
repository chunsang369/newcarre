/**
 * JSON → DB 적재 스크립트
 *
 * 크롤링 결과(data/hicarz-cars.json)를 Prisma로 upsert
 * 실행: npx tsx scripts/seed-from-json.ts
 *
 * 크롤링과 분리한 이유:
 * - 크롤링 실패해도 JSON만 있으면 DB 재적재 가능
 * - JSON 수동 편집 후 적재 가능 (이상치 보정)
 * - CI/CD에서 DB만 리셋하고 싶을 때 활용
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();
const JSON_PATH = path.join(process.cwd(), 'data', 'hicarz-cars.json');

interface CrawledOption {
  name: string;
  price: number;
  category?: string;
}

interface PriceMatrixEntry {
  period: 36 | 48 | 60;
  deposit: 'PREPAY_30' | 'DEPOSIT_30' | 'NO_DEPOSIT';
  mileage: 10000 | 20000 | 30000;
  monthlyRent: number;
  monthlyLease: number;
}

interface CrawledCar {
  brandSlug: string;
  slug: string;
  modelName: string;
  trimName: string;
  year: number;
  category?: string;
  fuelType?: string;
  basePrice: number;
  thumbnailUrl?: string;
  galleryUrls: string[];
  options: CrawledOption[];
  priceMatrix: PriceMatrixEntry[];
  sourceUrl: string;
  crawledAt: string;
}

// 매트릭스 배열 → 조회용 객체 변환
function matrixToObject(matrix: PriceMatrixEntry[]) {
  const obj: Record<string, { rent: number; lease: number }> = {};
  for (const entry of matrix) {
    const key = `${entry.period}_${entry.deposit}_${entry.mileage}`;
    obj[key] = { rent: entry.monthlyRent, lease: entry.monthlyLease };
  }
  return obj;
}

// 검증: 기본가가 0이거나 매트릭스가 비어있는 차량 필터
function isValidCar(car: CrawledCar): boolean {
  if (!car.modelName || !car.trimName) return false;
  if (car.basePrice <= 0) return false;
  if (car.priceMatrix.length === 0) return false;
  return true;
}

async function main() {
  console.log('📂 JSON 로드 중...');
  const raw = await fs.readFile(JSON_PATH, 'utf-8');
  const cars: CrawledCar[] = JSON.parse(raw);
  console.log(`   총 ${cars.length}대`);

  const validCars = cars.filter(isValidCar);
  const invalidCount = cars.length - validCars.length;
  if (invalidCount > 0) {
    console.warn(`⚠️ 유효성 검사 실패 ${invalidCount}대 제외 (기본가/매트릭스 결손)`);
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const car of validCars) {
    const brand = await prisma.brand.findUnique({
      where: { slug: car.brandSlug },
    });

    if (!brand) {
      console.warn(`⏭️ 브랜드 없음: ${car.brandSlug} (${car.modelName})`);
      skipped++;
      continue;
    }

    const existing = await prisma.car.findUnique({ where: { slug: car.slug } });

    await prisma.car.upsert({
      where: { slug: car.slug },
      update: {
        modelName: car.modelName,
        trimName: car.trimName,
        year: car.year,
        basePrice: car.basePrice,
        thumbnailUrl: car.thumbnailUrl ?? existing?.thumbnailUrl ?? '',
        options: car.options as any,
        priceMatrix: matrixToObject(car.priceMatrix) as any,
        isActive: true,
      },
      create: {
        slug: car.slug,
        brandId: brand.id,
        modelName: car.modelName,
        trimName: car.trimName,
        year: car.year,
        category: car.category ?? 'UNKNOWN',
        fuelType: car.fuelType ?? 'UNKNOWN',
        basePrice: car.basePrice,
        thumbnailUrl: car.thumbnailUrl ?? '',
        galleryUrls: car.galleryUrls,
        options: car.options as any,
        priceMatrix: matrixToObject(car.priceMatrix) as any,
        isActive: true,
      },
    });

    if (existing) updated++;
    else inserted++;
  }

  console.log('\n📊 적재 결과');
  console.log(`   신규: ${inserted}대`);
  console.log(`   갱신: ${updated}대`);
  console.log(`   스킵: ${skipped}대`);
  console.log('🎉 완료');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
