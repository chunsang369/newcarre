const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 2026년 7월 라이브 포털 API 직통 호출
async function fetchLiveMatrix(trimId) {
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

  const matrix = {};

  for (const period of periods) {
    for (const dist of distances) {
      for (const cond of conditions) {
        const url = `https://portal-api.chasalddae.com/rental/rental-calc-monthly?trimId=${trimId}&domain=chasalddae.com&adPayment=${cond.adPayment}&deposit=${cond.deposit}&period=${period}&distance=${dist.value}&insuranceAge=26&oiColorSumPrice=0&trimOptSumPrice=0`;
        const key = `${period}_${cond.label}_${dist.label}`;
        
        try {
          const res = await fetch(url);
          if (res.ok) {
            const json = await res.json();
            if (json.code === '200' && json.data) {
              matrix[key] = {
                rent: json.data.rent_price,
                lease: json.data.lease_price
              };
            }
          }
        } catch (e) {
          // ignore
        }
        await sleep(15);
      }
    }
  }

  return Object.keys(matrix).length > 0 ? matrix : null;
}

// DB 지연 재시도 헬퍼 함수
async function updateCarWithRetry(carId, data, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.car.update({
        where: { id: carId },
        data: data
      });
      return true;
    } catch (err) {
      console.warn(`[Warning] DB Update attempt ${attempt} failed for car ${carId}: ${err.message}`);
      if (attempt === maxRetries) {
        console.error(`[Error] DB Update permanently failed for car ${carId}`);
        return false;
      }
      await sleep(2000 * attempt);
    }
  }
}

async function main() {
  console.log('🚀 Starting Robust 1:1 Live API Sync with DB Retry Logic...');

  const cleanList = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
  console.log(`Loaded Chasalddae Active Lineup: ${cleanList.length} items.`);

  let carDataText = fs.readFileSync('prisma/car-data.ts', 'utf8');
  let popularCars = [];
  const popularCarsMatch = carDataText.match(/export const popularCars:\s*any\[\]\s*=\s*(\[[\s\S]*\]);?\s*$/) ||
                           carDataText.match(/export const popularCars\s*=\s*(\[[\s\S]*?\]);?\s*$/);
  if (popularCarsMatch) {
    popularCars = JSON.parse(popularCarsMatch[1]);
  }

  const dbCars = await prisma.car.findMany();
  console.log(`Initial DB Cars: ${dbCars.length}`);

  let successCount = 0;
  const activeCarIds = new Set();

  for (let i = 0; i < dbCars.length; i++) {
    const car = dbCars[i];
    const options = car.options || {};
    const grades = options.grades || [];
    let updatedAnyTrim = false;

    for (const grade of grades) {
      for (const trim of (grade.trims || [])) {
        let targetTrimId = trim.trimId;
        if (!targetTrimId && trim.idx) {
          const m = String(trim.idx).match(/(\d+)$/);
          if (m) targetTrimId = m[1];
        }

        if (!targetTrimId || !/^\d{3,}$/.test(targetTrimId)) {
          const matchedItem = cleanList.find(item => 
            item.modelName.includes(car.modelName) || car.modelName.includes(item.modelName)
          );
          if (matchedItem) {
            targetTrimId = matchedItem.trimId;
            trim.trimId = targetTrimId;
          }
        }

        if (targetTrimId && /^\d{3,}$/.test(targetTrimId)) {
          const liveMatrix = await fetchLiveMatrix(targetTrimId);
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
      successCount++;

      // DB 갱신 (지연 재시도 포함)
      await updateCarWithRetry(car.id, {
        options: options,
        priceMatrix: car.priceMatrix || {},
        isActive: true
      });

      // car-data.ts 갱신
      const popIdx = popularCars.findIndex(p => p.slug === car.slug);
      if (popIdx !== -1) {
        popularCars[popIdx].options = options;
        popularCars[popIdx].priceMatrix = car.priceMatrix;
      }

      if (successCount % 10 === 0 || i === dbCars.length - 1) {
        console.log(`[Sync Progress] Updated ${successCount} active cars with 2026 July live API data.`);
      }
    }
  }

  // 차살때 라인업에 존재하지 않는 차량 삭제
  const removeCars = dbCars.filter(c => !activeCarIds.has(c.id));
  if (removeCars.length > 0) {
    const removeIds = removeCars.map(c => c.id);
    const removeSlugs = removeCars.map(c => c.slug);

    try {
      await prisma.car.deleteMany({
        where: { id: { in: removeIds } }
      });
      console.log(`\n🗑️ Successfully cleaned up ${removeCars.length} obsolete cars.`);
    } catch (e) {
      console.error('Failed to batch delete obsolete cars:', e.message);
    }

    popularCars = popularCars.filter(c => !removeSlugs.includes(c.slug));
  }

  // car-data.ts 파일 쓰기
  const newContent = `// Auto-generated from Chasalddae 2026 July Live Sync\nexport const popularCars: any[] = ${JSON.stringify(popularCars, null, 2)};\n`;
  fs.writeFileSync('prisma/car-data.ts', newContent, 'utf8');

  const finalCarCount = await prisma.car.count();
  console.log(`\n==========================================`);
  console.log(`🎉 Robust Live API Sync Completed! Total Active Cars in DB: ${finalCarCount}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error in robust sync script:', err);
  process.exit(1);
});
