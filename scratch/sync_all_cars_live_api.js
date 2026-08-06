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
          // ignore or retry
        }
        await sleep(20);
      }
    }
  }

  return Object.keys(matrix).length > 0 ? matrix : null;
}

async function main() {
  console.log('🚀 Starting full synchronization with Chasalddae 2026 July Live API...');

  const carDataText = fs.readFileSync('prisma/car-data.ts', 'utf8');
  const popularCarsMatch = carDataText.match(/export const popularCars:\s*any\[\]\s*=\s*(\[[\s\S]*\]);?\s*$/) ||
                           carDataText.match(/export const popularCars\s*=\s*(\[[\s\S]*?\]);?\s*$/);
  
  let popularCars = [];
  if (popularCarsMatch) {
    popularCars = JSON.parse(popularCarsMatch[1]);
  }

  const cars = await prisma.car.findMany();
  console.log(`Processing ${cars.length} cars from database...`);

  let updatedCarCount = 0;
  let updatedTrimCount = 0;

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    const options = car.options || {};
    const grades = options.grades || [];
    let carUpdated = false;

    for (const grade of grades) {
      for (const trim of (grade.trims || [])) {
        // trimId 추출
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
            carUpdated = true;

            // car의 대표 priceMatrix도 최저가 트림의 것으로 갱신
            if (!car.priceMatrix || trim === grades[0]?.trims?.[0]) {
              car.priceMatrix = liveMatrix;
            }
          }
        }
      }
    }

    if (carUpdated) {
      // PostgreSQL DB 업데이트
      await prisma.car.update({
        where: { id: car.id },
        data: {
          options: options,
          priceMatrix: car.priceMatrix || {}
        }
      });

      // car-data.ts 내 대응 객체도 업데이트
      const targetPopularIndex = popularCars.findIndex(c => c.slug === car.slug);
      if (targetPopularIndex !== -1) {
        popularCars[targetPopularIndex].options = options;
        popularCars[targetPopularIndex].priceMatrix = car.priceMatrix;
      }

      updatedCarCount++;
      if (updatedCarCount % 5 === 0 || updatedCarCount === cars.length) {
        console.log(`[Progress] Synchronized ${updatedCarCount}/${cars.length} cars (${updatedTrimCount} trims)...`);
      }
    }
  }

  // car-data.ts 파일 쓰기
  const newContent = `// Auto-generated from Chasalddae 2026 July Live API Sync\nexport const popularCars: any[] = ${JSON.stringify(popularCars, null, 2)};\n`;
  fs.writeFileSync('prisma/car-data.ts', newContent, 'utf8');

  console.log(`\n🎉 Sync Complete! Updated ${updatedCarCount} cars and ${updatedTrimCount} trims with 2026 July Live API.`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error during live sync:', err);
  process.exit(1);
});
