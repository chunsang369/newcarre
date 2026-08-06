const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Tesla New Model 3 integration...');

  // 1. 차살때 1:1 수집 가격 로드
  const prices8545 = JSON.parse(fs.readFileSync('scratch/chasalddae_m3_8545_prices.json', 'utf8'));
  const prices8546 = JSON.parse(fs.readFileSync('scratch/chasalddae_m3_8546_prices.json', 'utf8'));
  const prices6343 = JSON.parse(fs.readFileSync('scratch/chasalddae_m3_6343_prices.json', 'utf8'));

  // 2. 색상 및 옵션 정보 로드
  const queryData = JSON.parse(fs.readFileSync('scratch/react_query_data_m3.json', 'utf8'));
  const queryDetail = queryData.state.queries[0].state.data;

  const colorsExt = queryDetail.trim_outer_color_list.map(c => ({
    idx: String(c.id),
    title: c.name,
    price: c.price,
    detail: c.detail || [],
    thumb: c.detail?.[0] || ''
  }));

  const colorsInt = queryDetail.trim_inner_color_list.map(c => ({
    idx: String(c.id),
    title: c.name,
    price: c.price,
    detail: c.detail || [],
    thumb: c.detail?.[0] || ''
  }));

  const trimOptions = queryDetail.trim_opt_list.map(o => ({
    idx: `opt_${o.id}`,
    title: o.name,
    price: o.price
  }));

  // 3. car-data.ts 로드
  const carDataText = fs.readFileSync('prisma/car-data.ts', 'utf8');
  const popularCarsMatch = carDataText.match(/export const popularCars:\s*any\[\]\s*=\s*(\[[\s\S]*\]);?\s*$/);
  let popularCars;
  let useTypePrefix = true;
  
  if (popularCarsMatch) {
    popularCars = JSON.parse(popularCarsMatch[1]);
  } else {
    const simpleMatch = carDataText.match(/export const popularCars\s*=\s*(\[[\s\S]*?\]);?\s*$/);
    if (simpleMatch) {
      popularCars = JSON.parse(simpleMatch[1]);
      useTypePrefix = false;
    } else {
      console.error('Failed to parse popularCars from car-data.ts');
      return;
    }
  }

  // 4. 통합 Tesla New Model 3 세부 트림 구성
  const integratedOptions = {
    grades: [
      {
        idx: 'g_2wd',
        name: '2026년형 전기 2WD',
        trims: [
          {
            idx: 't_8545',
            trimId: '8545',
            name: 'Standard (자동)',
            price: 41990000,
            colorsExt: colorsExt,
            colorsInt: colorsInt,
            options: trimOptions,
            rentOffset: 0,
            leaseOffset: 0,
            priceMatrix: prices8545
          },
          {
            idx: 't_8546',
            trimId: '8546',
            name: 'Premium (자동)',
            price: 52990000,
            colorsExt: colorsExt,
            colorsInt: colorsInt,
            options: trimOptions,
            rentOffset: 0,
            leaseOffset: 0,
            priceMatrix: prices8546
          }
        ]
      },
      {
        idx: 'g_4wd',
        name: '2026년형 전기 4WD',
        trims: [
          {
            idx: 't_6343',
            trimId: '6343',
            name: 'Performance (자동)',
            price: 59990000,
            colorsExt: colorsExt,
            colorsInt: colorsInt,
            options: trimOptions,
            rentOffset: 0,
            leaseOffset: 0,
            priceMatrix: prices6343
          }
        ]
      }
    ]
  };

  // 5. popularCars 배열 정리 (분리 상품 제거 및 통합 상품 업데이트)
  popularCars = popularCars.filter(c => c.slug !== 'tesla-new-model-3-8545' && c.slug !== 'tesla-new-model-3-8546');

  const perfIdx = popularCars.findIndex(c => c.slug === 'tesla-new-model-3');
  const teslaBrand = await prisma.brand.findUnique({ where: { slug: 'tesla' } });

  const integratedCarData = {
    slug: 'tesla-new-model-3',
    brandSlug: 'tesla',
    modelName: 'New Model 3',
    trimName: '2026년형',
    year: 2026,
    category: 'SEDAN',
    fuelType: 'EV',
    basePrice: 41990000,
    imageUrl: 'https://img.chasalddae.com/model/car_images/20240404113842827.png',
    isPopular: true,
    sortOrder: 220,
    options: integratedOptions,
    priceMatrix: prices8545
  };

  if (perfIdx !== -1) {
    popularCars[perfIdx] = {
      ...popularCars[perfIdx],
      ...integratedCarData
    };
  } else {
    popularCars.push(integratedCarData);
  }

  // car-data.ts 파일 업데이트
  let newContent = '';
  if (useTypePrefix) {
    newContent = `// Auto-generated from Chasalddae v2 crawling (patched both Model Y & Model 3)\nexport const popularCars: any[] = ${JSON.stringify(popularCars, null, 2)};\n`;
  } else {
    newContent = `// Auto-generated from Chasalddae v2 crawling (patched both Model Y & Model 3)\nexport const popularCars = ${JSON.stringify(popularCars, null, 2)};\n`;
  }
  fs.writeFileSync('prisma/car-data.ts', newContent, 'utf8');
  console.log('✅ Updated prisma/car-data.ts with integrated Model 3.');

  // 6. 데이터베이스 (PostgreSQL) 업데이트 및 분리 상품 삭제
  if (teslaBrand) {
    // 분리된 구 상품 삭제
    await prisma.car.deleteMany({
      where: {
        slug: { in: ['tesla-new-model-3-8545', 'tesla-new-model-3-8546'] }
      }
    });

    // 통합 상품 upsert
    await prisma.car.upsert({
      where: { slug: 'tesla-new-model-3' },
      update: {
        modelName: 'New Model 3',
        trimName: '2026년형',
        year: 2026,
        category: 'SEDAN',
        fuelType: 'EV',
        basePrice: 41990000,
        thumbnailUrl: 'https://img.chasalddae.com/model/car_images/20240404113842827.png',
        options: integratedOptions,
        priceMatrix: prices8545,
        isActive: true,
      },
      create: {
        slug: 'tesla-new-model-3',
        brandId: teslaBrand.id,
        modelName: 'New Model 3',
        trimName: '2026년형',
        year: 2026,
        category: 'SEDAN',
        fuelType: 'EV',
        basePrice: 41990000,
        thumbnailUrl: 'https://img.chasalddae.com/model/car_images/20240404113842827.png',
        galleryUrls: [],
        options: integratedOptions,
        priceMatrix: prices8545,
        isPopular: true,
        isActive: true,
        sortOrder: 220
      }
    });
    console.log('✅ Successfully updated PostgreSQL DB for tesla-new-model-3.');
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
