const fs = require('fs');

async function main() {
  console.log('Starting Tesla Model Y Long Range data patch...');

  // 1. 차살때 수집 가격 로드
  const apiPrices = JSON.parse(fs.readFileSync('scratch/chasalddae_model_y_api_prices.json', 'utf8'));

  // 2. 차살때 react-query hydration data 로드 (색상 및 옵션 등 원본 데이터)
  const queryData = JSON.parse(fs.readFileSync('scratch/react_query_data.json', 'utf8'));
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
    // 2번째 매칭 시도
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

  // 4. Premium Long Range 전용 options.grades 구조 및 색상/옵션 재구성
  // colorsExt 재구성
  const colorsExt = queryDetail.trim_outer_color_list.map(c => ({
    idx: String(c.id),
    title: c.name,
    price: c.price,
    detail: c.detail || [c.detail_color1, c.detail_color2].filter(Boolean),
    thumb: c.detail?.[0] || ''
  }));

  // colorsInt 재구성
  const colorsInt = queryDetail.trim_inner_color_list.map(c => ({
    idx: String(c.id),
    title: c.name,
    price: c.price,
    detail: c.detail || [c.detail_color1, c.detail_color2].filter(Boolean),
    thumb: c.detail?.[0] || ''
  }));

  // options 재구성
  const trimOptions = queryDetail.trim_opt_list.map(o => ({
    idx: `opt_${o.id}`,
    title: o.name,
    price: o.price
  }));

  // Premium Long Range (6342) 단일 등급 및 단일 트림 구조
  const newOptions = {
    grades: [
      {
        idx: "1",
        name: "2026년형 전기 AWD",
        trims: [
          {
            idx: "1_1",
            name: "Premium Long Range (자동)",
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
  };

  // 5. 6342 차량 객체 갱신
  const targetSlug = 'tesla-model-y-juniper-6342';
  const carIdx = popularCars.findIndex(c => c.slug === targetSlug);

  if (carIdx === -1) {
    console.error(`Car with slug ${targetSlug} not found in popularCars!`);
    return;
  }

  const oldCar = popularCars[carIdx];
  const updatedCar = {
    ...oldCar,
    modelName: "Model Y Juniper",
    trimName: "2026년형",
    year: 2026,
    category: "SUV",
    fuelType: "ELECTRIC",
    basePrice: 59990000,
    imageUrl: "https://img.chasalddae.com/model/car_images/20250117175613930.png",
    options: newOptions,
    priceMatrix: apiPrices // 정밀 27개 가격 주입!
  };

  popularCars[carIdx] = updatedCar;
  console.log(`Updated ${targetSlug} data successfully.`);

  // 6. 파일로 다시 저장
  let newContent = '';
  if (useTypePrefix) {
    newContent = `// Auto-generated from Chasalddae v2 crawling (pacthed)\nexport const popularCars: any[] = ${JSON.stringify(popularCars, null, 2)};\n`;
  } else {
    newContent = `// Auto-generated from Chasalddae v2 crawling (patched)\nexport const popularCars = ${JSON.stringify(popularCars, null, 2)};\n`;
  }

  fs.writeFileSync('prisma/car-data.ts', newContent, 'utf8');
  console.log('Successfully saved updated car-data.ts');
}

main().catch(console.error);
