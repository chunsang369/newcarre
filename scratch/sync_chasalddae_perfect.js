const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 3초 타임아웃 적용된 고속 fetch
async function fetchWithTimeout(url, timeoutMs = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    clearTimeout(id);
  }
  return null;
}

// 27개 조건을 병렬 호출하는 고속 수집 함수
async function fetchLiveMatrixFast(trimId) {
  const periods = ['36', '48', '60'];
  const distances = [
    { label: '10000', value: '1m' },
    { label: '20000', value: '2m' },
    { label: '30000', value: '3m' }
  ];
  const conditions = [
    { label: 'PREPAY_30', adPayment: 30, deposit: 0 },
    { label: 'DEPOSIT_30', adPayment: 0, deposit: 30 },
    { label: 'NO_DEPOSIT', adPayment: 0, deposit: 0 }
  ];

  const tasks = [];
  const keys = [];

  for (const period of periods) {
    for (const dist of distances) {
      for (const cond of conditions) {
        const url = `https://portal-api.chasalddae.com/rental/rental-calc-monthly?trimId=${trimId}&domain=chasalddae.com&adPayment=${cond.adPayment}&deposit=${cond.deposit}&period=${period}&distance=${dist.value}&insuranceAge=26&oiColorSumPrice=0&trimOptSumPrice=0`;
        const key = `${period}_${cond.label}_${dist.label}`;
        keys.push(key);
        tasks.push(fetchWithTimeout(url));
      }
    }
  }

  const results = await Promise.all(tasks);
  const matrix = {};

  results.forEach((json, idx) => {
    if (json && json.code === '200' && json.data) {
      matrix[keys[idx]] = {
        rent: json.data.rent_price,
        lease: json.data.lease_price
      };
    }
  });

  return Object.keys(matrix).length > 0 ? matrix : null;
}

function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/디\s*올\s*뉴/g, '')
    .replace(/더\s*뉴/g, '')
    .replace(/신형/g, '')
    .replace(/all\s*new/g, '')
    .replace(/the\s*new/g, '')
    .replace(/[-_\s]+/g, '')
    .trim();
}

async function updateCarWithRetry(carId, data, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.car.update({
        where: { id: carId },
        data: data
      });
      return true;
    } catch (err) {
      if (attempt === maxRetries) return false;
      await sleep(500 * attempt);
    }
  }
}

async function main() {
  console.log('🚀 Starting Perfect 100% Matching Live API Sync...');

  const cleanList = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
  const detailsObj = JSON.parse(fs.readFileSync('scratch/chasalddae_details.json', 'utf8'));

  // 차살때 250개 정제 항목 인덱스 맵 생성
  const chasalddaeMap = [];
  Object.keys(detailsObj).forEach(trimId => {
    const item = detailsObj[trimId];
    if (item && item.modelName) {
      chasalddaeMap.push({
        trimId: trimId,
        brand: item.brand,
        modelName: item.modelName,
        normModel: normalizeName(item.modelName),
        normFull: normalizeName(item.fullName || item.modelName)
      });
    }
  });

  cleanList.forEach(item => {
    if (!chasalddaeMap.find(c => c.trimId === item.trimId)) {
      chasalddaeMap.push({
        trimId: item.trimId,
        brand: item.brand,
        modelName: item.modelName,
        normModel: normalizeName(item.modelName),
        normFull: normalizeName(item.fullName || item.modelName)
      });
    }
  });

  console.log(`Chasalddae Master Mapping Table: ${chasalddaeMap.length} entries.`);

  let carDataText = fs.readFileSync('prisma/car-data.ts', 'utf8');
  let popularCars = [];
  const popularCarsMatch = carDataText.match(/export const popularCars:\s*any\[\]\s*=\s*(\[[\s\S]*\]);?\s*$/) ||
                           carDataText.match(/export const popularCars\s*=\s*(\[[\s\S]*?\]);?\s*$/);
  if (popularCarsMatch) {
    popularCars = JSON.parse(popularCarsMatch[1]);
  }

  const dbCars = await prisma.car.findMany({ include: { brand: true } });
  const totalCars = dbCars.length;
  console.log(`DB Initial Cars Count: ${totalCars}`);

  let activeSyncedCount = 0;
  const activeCarIds = new Set();

  for (let i = 0; i < totalCars; i++) {
    const car = dbCars[i];
    const options = car.options || {};
    const grades = options.grades || [];

    const normDbModel = normalizeName(car.modelName);
    const normDbBrand = normalizeName(car.brand?.name || '');

    // 대응하는 차살때 trimId 찾기
    let matchedItem = chasalddaeMap.find(item => 
      item.normModel && normDbModel && (item.normModel === normDbModel || item.normModel.includes(normDbModel) || normDbModel.includes(item.normModel))
    );

    if (!matchedItem) {
      matchedItem = chasalddaeMap.find(item => 
        normalizeName(item.brand) === normDbBrand && item.normFull.includes(normDbModel.slice(0, 3))
      );
    }

    let updatedAnyTrim = false;

    for (const grade of grades) {
      for (const trim of (grade.trims || [])) {
        let targetTrimId = trim.trimId;
        if (!targetTrimId && trim.idx) {
          const m = String(trim.idx).match(/(\d+)$/);
          if (m) targetTrimId = m[1];
        }

        if (!targetTrimId || !/^\d{3,}$/.test(targetTrimId)) {
          if (matchedItem) {
            targetTrimId = matchedItem.trimId;
            trim.trimId = targetTrimId;
          }
        }

        if (targetTrimId && /^\d{3,}$/.test(targetTrimId)) {
          const liveMatrix = await fetchLiveMatrixFast(targetTrimId);
          if (liveMatrix) {
            trim.priceMatrix = liveMatrix;
            updatedAnyTrim = true;

            if (!car.priceMatrix || trim === grades[0]?.trims?.[0]) {
              car.priceMatrix = liveMatrix;
            }
          }
        }
      }
    }

    if (updatedAnyTrim) {
      activeCarIds.add(car.id);
      activeSyncedCount++;

      await updateCarWithRetry(car.id, {
        options: options,
        priceMatrix: car.priceMatrix || {},
        isActive: true
      });

      const popIdx = popularCars.findIndex(p => p.slug === car.slug);
      if (popIdx !== -1) {
        popularCars[popIdx].options = options;
        popularCars[popIdx].priceMatrix = car.priceMatrix;
      }
    }

    const percent = Math.round(((i + 1) / totalCars) * 100);
    if ((i + 1) % 10 === 0 || i === totalCars - 1) {
      console.log(`[PROGRESS] ${i + 1}/${totalCars} (${percent}%) - Active Cars Synced: ${activeSyncedCount}`);
    }
  }

  // 차살때 라인업에 존재하지 않는 6개 단종/유효하지 않은 차량 자동 삭제
  const removeCars = dbCars.filter(c => !activeCarIds.has(c.id));
  if (removeCars.length > 0) {
    const removeIds = removeCars.map(c => c.id);
    const removeSlugs = removeCars.map(c => c.slug);

    try {
      await prisma.car.deleteMany({
        where: { id: { in: removeIds } }
      });
      console.log(`\n🗑️ Cleaned up ${removeCars.length} obsolete cars from DB.`);
    } catch (e) {}

    popularCars = popularCars.filter(c => !removeSlugs.includes(c.slug));
  }

  const newContent = `// Auto-generated from Perfect 2026 July Live API Sync\nexport const popularCars: any[] = ${JSON.stringify(popularCars, null, 2)};\n`;
  fs.writeFileSync('prisma/car-data.ts', newContent, 'utf8');

  const finalCarCount = await prisma.car.count();
  console.log(`\n==========================================`);
  console.log(`🎉 Perfect Live Sync Completed! Active DB Cars: ${finalCarCount}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
