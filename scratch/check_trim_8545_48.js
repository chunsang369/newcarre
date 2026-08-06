const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log('=== [차살때 vs 제로카즈 trim_id=8545 (48개월, 렌트, 선수금30%, 2만km) 1:1 대조] ===');

  // 1. 차살때 수집 원본 JSON 데이터 확인
  const rawMatrix8545 = JSON.parse(fs.readFileSync('scratch/chasalddae_m3_8545_prices.json', 'utf8'));
  const targetKey = '48_PREPAY_30_20000';
  const rawRentPrice = rawMatrix8545[targetKey]?.rent;
  const rawLeasePrice = rawMatrix8545[targetKey]?.lease;

  console.log(`\n1. 차살때 원본 수집 데이터 (${targetKey}):`);
  console.log(`   - 렌트 월 납입금 (purchase_type=2): ${rawRentPrice?.toLocaleString()}원`);
  console.log(`   - 리스 월 납입금 (purchase_type=1): ${rawLeasePrice?.toLocaleString()}원`);

  // 2. DB의 tesla-new-model-3 차량 트림(8545) 데이터 확인
  const car = await prisma.car.findUnique({ where: { slug: 'tesla-new-model-3' } });
  if (!car) {
    console.error('❌ tesla-new-model-3 차량을 찾을 수 없습니다.');
    return;
  }

  const grades = car.options?.grades || [];
  let foundTrim = null;
  for (const g of grades) {
    const t = g.trims?.find((t) => t.trimId === '8545' || t.idx === 't_8545');
    if (t) {
      foundTrim = t;
      break;
    }
  }

  if (!foundTrim) {
    console.error('❌ trim_id=8545 트림을 찾지 못했습니다.');
    return;
  }

  console.log(`\n2. 제로카즈 DB 저장 트림 정보:`);
  console.log(`   - 트림명: ${foundTrim.name}`);
  console.log(`   - 차량가: ${foundTrim.price.toLocaleString()}원`);
  const dbMatrixPrice = foundTrim.priceMatrix?.[targetKey];
  console.log(`   - DB 내 priceMatrix [${targetKey}]: 렌트 ${dbMatrixPrice?.rent?.toLocaleString()}원 / 리스 ${dbMatrixPrice?.lease?.toLocaleString()}원`);

  // 3. CarDetailClient 연산 로직 에뮬레이션
  // (period="48", deposit="PREPAY_30", mileage="20000", buyMethod="RENT")
  const key = `${'48'}_${'PREPAY_30'}_${'20000'}`;
  const matrix = foundTrim.priceMatrix;
  const baseEntry = matrix[key];
  const baseMonthly = baseEntry.rent;

  const baseTrimPrice = Number(foundTrim.price);
  const currentTrimPrice = Number(foundTrim.price);
  const trimPriceDiff = Math.max(0, currentTrimPrice - baseTrimPrice); // 0
  const totalPriceDiff = trimPriceDiff; // 옵션 0, 색상 0일 때 0
  const added = Math.floor(totalPriceDiff * 0.009); // 0
  const multiplier = 0.90;

  const finalMonthly = Math.floor(baseMonthly + (added * multiplier));

  console.log(`\n3. 제로카즈 클라이언트 실제 연산 월 렌트료: ${finalMonthly.toLocaleString()}원`);

  console.log(`\n==========================================`);
  const isRentEqual = finalMonthly === rawRentPrice;
  console.log(`최종 1:1 검증 결과: ${isRentEqual ? '★ 1:1 정확히 100% 일치 ★' : '오차 발생'}`);
  console.log(`차살때 렌트료: ${rawRentPrice.toLocaleString()}원 vs 제로카즈 렌트료: ${finalMonthly.toLocaleString()}원 (차이: ${finalMonthly - rawRentPrice}원)`);

  await prisma.$disconnect();
}

main().catch(console.error);
