const fs = require('fs');

async function main() {
  console.log('Starting BOTH Model Y (RWD & LR) data patch...');

  // 1. 차살때 수집 가격 로드
  const apiPrices6341 = JSON.parse(fs.readFileSync('scratch/chasalddae_6341_prices.json', 'utf8'));
  const apiPrices6342 = JSON.parse(fs.readFileSync('scratch/chasalddae_6342_prices.json', 'utf8'));

  // 2. car-data.ts 로드 및 파싱
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

  // ==========================================
  // [A] RWD 모델 패치 (tesla-model-y-juniper)
  // ==========================================
  const rwdSlug = 'tesla-model-y-juniper';
  const rwdIdx = popularCars.findIndex(c => c.slug === rwdSlug);
  if (rwdIdx !== -1) {
    const oldRwd = popularCars[rwdIdx];
    popularCars[rwdIdx] = {
      ...oldRwd,
      modelName: "Model Y Juniper",
      trimName: "2026년형",
      year: 2026,
      category: "SUV",
      fuelType: "ELECTRIC",
      basePrice: 49990000,
      priceMatrix: apiPrices6341 // 정밀 6341(RWD) 가격 이식!
    };
    console.log(`✅ Patched RWD Model Y (${rwdSlug}) basePrice and priceMatrix.`);
  } else {
    console.error(`RWD car with slug ${rwdSlug} not found!`);
  }

  // ==========================================
  // [B] Long Range 모델 패치 (tesla-model-y-juniper-6342)
  // ==========================================
  const lrSlug = 'tesla-model-y-juniper-6342';
  const lrIdx = popularCars.findIndex(c => c.slug === lrSlug);
  if (lrIdx !== -1) {
    const oldLr = popularCars[lrIdx];
    popularCars[lrIdx] = {
      ...oldLr,
      modelName: "Model Y Juniper",
      trimName: "2026년형",
      year: 2026,
      category: "SUV",
      fuelType: "ELECTRIC",
      basePrice: 59990000,
      priceMatrix: apiPrices6342 // 정밀 6342(LR) 가격 이식!
    };
    console.log(`✅ Patched Long Range Model Y (${lrSlug}) basePrice and priceMatrix.`);
  } else {
    console.error(`Long Range car with slug ${lrSlug} not found!`);
  }

  // 6. 파일로 다시 저장
  let newContent = '';
  if (useTypePrefix) {
    newContent = `// Auto-generated from Chasalddae v2 crawling (patched both)\nexport const popularCars: any[] = ${JSON.stringify(popularCars, null, 2)};\n`;
  } else {
    newContent = `// Auto-generated from Chasalddae v2 crawling (patched both)\nexport const popularCars = ${JSON.stringify(popularCars, null, 2)};\n`;
  }

  fs.writeFileSync('prisma/car-data.ts', newContent, 'utf8');
  console.log('Successfully saved updated car-data.ts');
}

main().catch(console.error);
