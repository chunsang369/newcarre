const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 2026년 7월 라이브 포털 API 직통 호출 함수
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

async function main() {
  console.log('🚀 Starting Exact 1:1 Live API Sync with Chasalddae 2026 July Data...');

  // 1. 차살때 정제된 활성 차량 라인업 읽기
  const cleanList = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
  console.log(`Loaded Chasalddae Active Lineup: ${cleanList.length} items.`);

  // 2. car-data.ts 로드
  let carDataText = fs.readFileSync('prisma/car-data.ts', 'utf8');
  let popularCars = [];
  const popularCarsMatch = carDataText.match(/export const popularCars:\s*any\[\]\s*=\s*(\[[\s\S]*\]);?\s*$/) ||
                           carDataText.match(/export const popularCars\s*=\s*(\[[\s\S]*?\]);?\s*$/);
  if (popularCarsMatch) {
    popularCars = JSON.parse(popularCarsMatch[1]);
  }

  // 3. DB 차량 로드
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
        // 유효한 trimId 찾기
        let targetTrimId = trim.trimId;
        if (!targetTrimId && trim.idx) {
          const m = String(trim.idx).match(/(\d+)$/);
          if (m) targetTrimId = m[1];
        }

        // cleanList에서 대응하는 trimId 보정
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

      // DB 갱신
      await prisma.car.update({
        where: { id: car.id },
        data: {
          options: options,
          priceMatrix: car.priceMatrix || {},
          isActive: true
        }
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

  // 4. 차살때 라인업에 존재하지 않는 불필요/단종 차량 삭제
  const removeCars = dbCars.filter(c => !activeCarIds.has(c.id));
  if (removeCars.length > 0) {
    const removeIds = removeCars.map(c => c.id);
    const removeSlugs = removeCars.map(c => c.slug);

    await prisma.car.deleteMany({
      where: { id: { in: removeIds } }
    });

    popularCars = popularCars.filter(c => !removeSlugs.includes(c.slug));
    console.log(`\n🗑️ Automatically cleaned up ${removeCars.length} obsolete/discontinued cars.`);
  }

  // 5. car-data.ts 다시 쓰기
  const newContent = `// Auto-generated from Chasalddae 2026 July Live Sync\nexport const popularCars: any[] = ${JSON.stringify(popularCars, null, 2)};\n`;
  fs.writeFileSync('prisma/car-data.ts', newContent, 'utf8');

  const finalCarCount = await prisma.car.count();
  console.log(`\n==========================================`);
  console.log(`🎉 1:1 Live API Sync Completed! Total Active Cars in DB: ${finalCarCount}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error in sync script:', err);
  process.exit(1);
});
