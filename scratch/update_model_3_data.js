const fs = require('fs');

async function main() {
  console.log('Starting Tesla New Model 3 data patch...');

  // 1. 차살때 수집 가격 로드
  const prices8545 = JSON.parse(fs.readFileSync('scratch/chasalddae_m3_8545_prices.json', 'utf8'));
  const prices8546 = JSON.parse(fs.readFileSync('scratch/chasalddae_m3_8546_prices.json', 'utf8'));
  const prices6343 = JSON.parse(fs.readFileSync('scratch/chasalddae_m3_6343_prices.json', 'utf8'));

  // 2. 차살때 react-query hydration data 로드 (색상 및 옵션 등 원본 데이터)
  const queryData = JSON.parse(fs.readFileSync('scratch/react_query_data_m3.json', 'utf8'));
  const queryDetail = queryData.state.queries[0].state.data;

  // 3. car-data.ts 로드 및 파싱
  const carDataText = fs.readFileSync('prisma/car-data.ts', 'utf8');
  
  // export const popularCars = [ ... ] 패턴 추출
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

  console.log(`Loaded ${popularCars.length} cars from car-data.ts`);

  // 색상 및 옵션 재구성
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

  // ==========================================
  // [A] Standard 모델 빌드 (tesla-new-model-3-8545)
  // ==========================================
  const standardCar = {
    slug: 'tesla-new-model-3-8545',
    brandSlug: 'tesla',
    modelName: 'New Model 3',
    trimName: '2026년형',
    year: 2026,
    category: 'SEDAN',
    fuelType: 'EV',
    basePrice: 41990000,
    imageUrl: 'https://img.chasalddae.com/model/car_images/20240404113842827.png',
    isPopular: false,
    sortOrder: 220,
    options: {
      grades: [
        {
          idx: '1',
          name: '2026년형 전기 2WD',
          trims: [
            {
              idx: '1_1',
              name: 'Standard (자동)',
              price: 41990000,
              colorsExt: colorsExt,
              colorsInt: colorsInt,
              options: trimOptions,
              rentOffset: 0,
              leaseOffset: 0
            }
          ]
        }
      ]
    },
    priceMatrix: prices8545
  };

  // ==========================================
  // [B] Premium 모델 빌드 (tesla-new-model-3-8546)
  // ==========================================
  const premiumCar = {
    slug: 'tesla-new-model-3-8546',
    brandSlug: 'tesla',
    modelName: 'New Model 3',
    trimName: '2026년형',
    year: 2026,
    category: 'SEDAN',
    fuelType: 'EV',
    basePrice: 52990000,
    imageUrl: 'https://img.chasalddae.com/model/car_images/20240404113842827.png',
    isPopular: false,
    sortOrder: 221,
    options: {
      grades: [
        {
          idx: '1',
          name: '2026년형 전기 2WD',
          trims: [
            {
              idx: '1_1',
              name: 'Premium (자동)',
              price: 52990000,
              colorsExt: colorsExt,
              colorsInt: colorsInt,
              options: trimOptions,
              rentOffset: 0,
              leaseOffset: 0
            }
          ]
        }
      ]
    },
    priceMatrix: prices8546
  };

  // ==========================================
  // [C] Performance 기존 모델 패치 (tesla-new-model-3)
  // ==========================================
  const perfSlug = 'tesla-new-model-3';
  const perfIdx = popularCars.findIndex(c => c.slug === perfSlug);
  if (perfIdx === -1) {
    console.error(`Performance car with slug ${perfSlug} not found in popularCars!`);
    return;
  }

  const oldPerf = popularCars[perfIdx];
  const updatedPerf = {
    ...oldPerf,
    modelName: "New Model 3",
    trimName: "2026년형",
    year: 2026,
    category: "SEDAN",
    fuelType: "ELECTRIC",
    basePrice: 59990000,
    imageUrl: "https://img.chasalddae.com/model/car_images/20240404113842827.png",
    options: {
      grades: [
        {
          idx: '1',
          name: '2026년형 전기 4WD',
          trims: [
            {
              idx: '1_1',
              name: 'Performance (자동)',
              price: 59990000,
              colorsExt: colorsExt,
              colorsInt: colorsInt,
              options: trimOptions,
              rentOffset: 0,
              leaseOffset: 0
            }
          ]
        }
      ]
    },
    priceMatrix: prices6343
  };

  popularCars[perfIdx] = updatedPerf;
  console.log('✅ Patched Performance Model 3 (tesla-new-model-3).');

  // 중복 추가 방지하며 Standard, Premium 추가
  const removeExist = (slug) => {
    const idx = popularCars.findIndex(c => c.slug === slug);
    if (idx !== -1) popularCars.splice(idx, 1);
  };
  removeExist(standardCar.slug);
  removeExist(premiumCar.slug);

  popularCars.push(standardCar);
  popularCars.push(premiumCar);
  console.log('✅ Added Standard and Premium Model 3 cars.');

  // 6. 파일로 다시 저장
  let newContent = '';
  if (useTypePrefix) {
    newContent = `// Auto-generated from Chasalddae v2 crawling (patched both Model Y & Model 3)\nexport const popularCars: any[] = ${JSON.stringify(popularCars, null, 2)};\n`;
  } else {
    newContent = `// Auto-generated from Chasalddae v2 crawling (patched both Model Y & Model 3)\nexport const popularCars = ${JSON.stringify(popularCars, null, 2)};\n`;
  }

  fs.writeFileSync('prisma/car-data.ts', newContent, 'utf8');
  console.log('Successfully saved updated car-data.ts');
}

main().catch(console.error);
