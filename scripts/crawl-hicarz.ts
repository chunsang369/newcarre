/**
 * 하이카즈 차량 데이터 크롤러 (HTTP 기반)
 *
 * Playwright 없이 fetch + regex로 m.hicarzautoplan.com에서 차량 데이터를 수집합니다.
 * 수집된 데이터는 data/hicarz-cars.json에 저장됩니다.
 *
 * 실행:
 *   npx tsx scripts/crawl-hicarz.ts
 *   DRY_RUN=true npx tsx scripts/crawl-hicarz.ts
 */

import fs from 'fs/promises';
import path from 'path';

const DRY_RUN = process.env.DRY_RUN === 'true';
const BASE_URL = 'https://m.hicarzautoplan.com';
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'hicarz-cars.json');

interface CrawledCar {
  brandSlug: string;
  slug: string;
  modelName: string;
  trimName: string;
  year: number;
  category: string;
  fuelType: string;
  basePrice: number;
  galleryUrls: string[];
  options: { name: string; price: number; category?: string }[];
  priceMatrix: {
    period: number;
    deposit: string;
    mileage: number;
    monthlyRent: number;
    monthlyLease: number;
  }[];
  sourceUrl: string;
  crawledAt: string;
}

const BRAND_MAP: Record<string, string> = {
  '현대': 'hyundai', '기아': 'kia', '제네시스': 'genesis',
  '르노코리아': 'renault-korea', '쉐보레': 'chevrolet', 'KGM': 'kgm',
  'BMW': 'bmw', '벤츠': 'mercedes-benz', '아우디': 'audi',
  '볼보': 'volvo', '폭스바겐': 'volkswagen', '토요타': 'toyota',
  '렉서스': 'lexus', '지프': 'jeep', '테슬라': 'tesla',
  '포르쉐': 'porsche', 'BYD': 'byd',
};

function inferCategory(model: string, trim: string): string {
  const suv = ['셀토스', '니로', 'GV70', 'GV80', '싼타페', '투싼', '코나', '팰리세이드',
    '스포티지', '쏘렌토', 'EV3', 'EV6', 'EV9', '티볼리', 'Avenger', 'X5', 'X3', 'GLC'];
  const sedan = ['아반떼', 'K5', 'K8', 'K9', '그랜저', '쏘나타', 'G80', 'G70', 'G90'];
  if (suv.some(s => model.includes(s))) return 'SUV';
  if (sedan.some(s => model.includes(s))) return 'SEDAN';
  return 'UNKNOWN';
}

function inferFuel(trim: string): string {
  if (trim.includes('전기')) return 'ELECTRIC';
  if (trim.includes('하이브리드')) return 'HYBRID';
  if (trim.includes('디젤')) return 'DIESEL';
  return 'GASOLINE';
}

function slugify(brand: string, model: string, trim: string, year: number, idx: number): string {
  const b = BRAND_MAP[brand] || brand.toLowerCase().replace(/\s+/g, '-');
  const m = model.replace(/[^a-zA-Z0-9가-힣\s]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
  const base = `${b}-${m}-${year}`;
  return idx > 0 ? `${base}-v${idx + 1}` : base;
}

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      'Accept': 'text/html',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function parsePrice(text: string): number {
  const cleaned = text.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

async function crawl(): Promise<CrawledCar[]> {
  console.log('🔍 하이카즈 홈페이지 크롤링 (HTTP)...');
  const html = await fetchHTML(BASE_URL);

  const cars: CrawledCar[] = [];
  const slugCount: Record<string, number> = {};

  // 패턴: ##### 2026년형 → ### 브랜드 모델명 → 트림 → ##### 월 NNN,NNN원~
  const pattern = /#{5}\s*(\d{4})년형\s*\n\s*\n\s*#{3}\s*(.+?)\n\s*(.+?)\n[\s\S]*?#{5}\s*월\s*([\d,]+)원/g;

  let match;
  while ((match = pattern.exec(html)) !== null) {
    const year = parseInt(match[1], 10);
    const brandModel = match[2].trim();
    const trim = match[3].trim().replace(/\[add 상세\].*/, '').trim();
    const monthlyRent = parsePrice(match[4]);

    // 브랜드 파싱
    let brand = '';
    let model = '';
    for (const bName of Object.keys(BRAND_MAP)) {
      if (brandModel.startsWith(bName + ' ')) {
        brand = bName;
        model = brandModel.slice(bName.length + 1);
        break;
      }
    }
    if (!brand) {
      const parts = brandModel.split(' ');
      brand = parts[0];
      model = parts.slice(1).join(' ');
    }

    const baseSlug = `${BRAND_MAP[brand] || brand.toLowerCase()}-${model.replace(/\s+/g, '-').toLowerCase()}-${year}`;
    const count = slugCount[baseSlug] || 0;
    slugCount[baseSlug] = count + 1;

    const car: CrawledCar = {
      brandSlug: BRAND_MAP[brand] || brand.toLowerCase(),
      slug: slugify(brand, model, trim, year, count),
      modelName: model,
      trimName: trim,
      year,
      category: inferCategory(model, trim),
      fuelType: inferFuel(trim),
      basePrice: 0,
      galleryUrls: [],
      options: [],
      priceMatrix: [
        { period: 36, deposit: 'PREPAY_30', mileage: 20000, monthlyRent, monthlyLease: Math.round(monthlyRent * 1.1) },
        { period: 48, deposit: 'PREPAY_30', mileage: 20000, monthlyRent: Math.round(monthlyRent * 0.92), monthlyLease: Math.round(monthlyRent * 0.92 * 1.1) },
        { period: 60, deposit: 'PREPAY_30', mileage: 20000, monthlyRent: Math.round(monthlyRent * 0.85), monthlyLease: Math.round(monthlyRent * 0.85 * 1.1) },
      ],
      sourceUrl: BASE_URL,
      crawledAt: new Date().toISOString(),
    };

    cars.push(car);
    console.log(`  ✅ [${cars.length}] ${brand} ${model} — ${trim} — 월 ${monthlyRent.toLocaleString()}원`);
  }

  return cars;
}

async function main() {
  console.log('🚗 하이카즈 크롤러 시작 (HTTP 모드)');
  console.log(`   DRY_RUN: ${DRY_RUN}\n`);

  const cars = await crawl();
  console.log(`\n🎯 총 수집: ${cars.length}대`);

  if (DRY_RUN) {
    console.log('\n--- DRY RUN (파일 저장 안 함) ---');
    console.log(JSON.stringify(cars.slice(0, 3), null, 2));
    console.log(`... 외 ${Math.max(0, cars.length - 3)}대`);
  } else {
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(cars, null, 2), 'utf-8');
    console.log(`\n💾 저장 완료: ${OUTPUT_PATH}`);
  }

  console.log('\n🎉 크롤러 종료');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
