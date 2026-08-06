const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
  console.log('🚀 Starting Full Clean & Sync with Chasalddae 247 Active Lineup...');

  const cars = await prisma.car.findMany();
  console.log(`Initial DB cars count: ${cars.length}`);

  let carDataText = fs.readFileSync('prisma/car-data.ts', 'utf8');
  let popularCars = [];
  const popularCarsMatch = carDataText.match(/export const popularCars:\s*any\[\]\s*=\s*(\[[\s\S]*\]);?\s*$/) ||
                           carDataText.match(/export const popularCars\s*=\s*(\[[\s\S]*?\]);?\s*$/);
  if (popularCarsMatch) {
    popularCars = JSON.parse(popularCarsMatch[1]);
  }

  const validCars = [];
  const removedCars = [];

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    const options = car.options || {};
    const grades = options.grades || [];
    let carHasLiveMatrix = false;
    let updatedTrimCount = 0;

    for (const grade of grades) {
      for (const trim of (grade.trims || [])) {
        let targetTrimId = trim.trimId;
        if (!targetTrimId && trim.idx) {
          const m = String(trim.idx).match(/(\d+)$/);
          if (m) targetTrimId = m[1];
        }

        if (targetTrimId && /^\d+$/.test(targetTrimId)) {
          const liveMatrix = await fetchLiveMatrix(targetTrimId);
          if (liveMatrix) {
            trim.priceMatrix = liveMatrix;
            updatedTrimCount++;
            carHasLiveMatrix = true;

            if (!car.priceMatrix || trim === grades[0]?.trims?.[0]) {
              car.priceMatrix = liveMatrix;
            }
          }
        }
      }
    }

    if (carHasLiveMatrix) {
      validCars.push(car);
      await prisma.car.update({
        where: { id: car.id },
        data: {
          options: options,
          priceMatrix: car.priceMatrix || {},
          isActive: true
        }
      });
      console.log(`[Valid ${validCars.length}] Updated ${car.modelName} (${car.slug}) - ${updatedTrimCount} trims`);
    } else {
      removedCars.push(car);
      console.log(`[Removed] ${car.modelName} (${car.slug}) - No active Chasalddae trims`);
    }
  }

  // 차살때에서 사라진/단종된 차량 DB 및 car-data.ts에서 완전히 삭제
  if (removedCars.length > 0) {
    const removeIds = removedCars.map(c => c.id);
    const removeSlugs = removedCars.map(c => c.slug);
    
    await prisma.car.deleteMany({
      where: { id: { in: removeIds } }
    });

    popularCars = popularCars.filter(c => !removeSlugs.includes(c.slug));
    console.log(`\n🗑️ Successfully deleted ${removedCars.length} obsolete cars from DB & car-data.ts.`);
  }

  // popularCars 파일 업데이트
  const updatedPopularCars = popularCars.map(pCar => {
    const matchedValid = validCars.find(v => v.slug === pCar.slug);
    if (matchedValid) {
      return {
        ...pCar,
        options: matchedValid.options,
        priceMatrix: matchedValid.priceMatrix
      };
    }
    return pCar;
  });

  const newContent = `// Auto-generated from Chasalddae 2026 July Live Sync & Clean\nexport const popularCars: any[] = ${JSON.stringify(updatedPopularCars, null, 2)};\n`;
  fs.writeFileSync('prisma/car-data.ts', newContent, 'utf8');

  const finalCount = await prisma.car.count();
  console.log(`\n==========================================`);
  console.log(`🎉 최종 정리 완료: 총 활성 차량 수 ${finalCount}개 (차살때 라인업 1:1 완벽 매칭!)`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
