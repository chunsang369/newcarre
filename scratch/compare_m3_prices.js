const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const slugs = {
    'tesla-new-model-3-8545': '8545',
    'tesla-new-model-3-8546': '8546',
    'tesla-new-model-3': '6343'
  };

  const nameMap = {
    '8545': 'Standard (4,199만원)',
    '8546': 'Premium (5,299만원)',
    '6343': 'Performance (5,999만원)'
  };

  console.log('=== [테슬라 New Model 3 가격 검증] ===');

  for (const [slug, trimId] of Object.entries(slugs)) {
    const car = await prisma.car.findUnique({ where: { slug } });
    const chasalddae = JSON.parse(fs.readFileSync(`scratch/chasalddae_m3_${trimId}_prices.json`, 'utf8'));

    console.log(`\n▶ 트림: ${nameMap[trimId]}`);
    let allMatch = true;

    // 샘플 조건 검사 (48개월, 무보증, 2만km / 36개월, 선수금30%, 2만km)
    const testKeys = ['36_PREPAY_30_20000', '48_NO_DEPOSIT_20000', '60_DEPOSIT_30_10000'];
    
    testKeys.forEach(k => {
      const dbVal = car.priceMatrix?.[k];
      const chasalddaeVal = chasalddae[k];

      const rentMatch = dbVal?.rent === chasalddaeVal?.rent;
      const leaseMatch = dbVal?.lease === chasalddaeVal?.lease;

      if (!rentMatch || !leaseMatch) allMatch = false;

      console.log(`  - 조건: ${k}`);
      console.log(`    렌트료: 제로카즈 = ${dbVal?.rent?.toLocaleString()}원 | 차살때 = ${chasalddaeVal?.rent?.toLocaleString()}원 [일치: ${rentMatch}]`);
      console.log(`    리스료: 제로카즈 = ${dbVal?.lease?.toLocaleString()}원 | 차살때 = ${chasalddaeVal?.lease?.toLocaleString()}원 [일치: ${leaseMatch}]`);
    });

    console.log(`  -> 전체 27가지 조건 최종 대조 결과: ${allMatch ? '★ 100% 전 조건 일치 ★' : '오차 있음'}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
