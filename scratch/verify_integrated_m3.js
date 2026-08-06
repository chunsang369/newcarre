const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log('=== [통합 Tesla New Model 3 차살때 1:1 데이터 대조 검증] ===');

  const car = await prisma.car.findUnique({ where: { slug: 'tesla-new-model-3' } });
  if (!car) {
    console.error('❌ integrated car tesla-new-model-3 not found!');
    process.exit(1);
  }

  const prices8545 = JSON.parse(fs.readFileSync('scratch/chasalddae_m3_8545_prices.json', 'utf8'));
  const prices8546 = JSON.parse(fs.readFileSync('scratch/chasalddae_m3_8546_prices.json', 'utf8'));
  const prices6343 = JSON.parse(fs.readFileSync('scratch/chasalddae_m3_6343_prices.json', 'utf8'));

  const options = car.options;
  const trims = [];
  options.grades.forEach(g => {
    g.trims.forEach(t => {
      trims.push(t);
    });
  });

  console.log(`구출된 총 트림 수: ${trims.length}개`);

  const testCases = [
    { trimId: '8545', expectedMatrix: prices8545, name: 'Standard (4,199만원)' },
    { trimId: '8546', expectedMatrix: prices8546, name: 'Premium (5,299만원)' },
    { trimId: '6343', expectedMatrix: prices6343, name: 'Performance (5,999만원)' }
  ];

  let totalMatched = 0;
  let totalChecked = 0;

  testCases.forEach(({ trimId, expectedMatrix, name }) => {
    const targetTrim = trims.find(t => t.trimId === trimId);
    console.log(`\n▶ 트림 대조: ${name} (trimId: ${trimId})`);
    
    if (!targetTrim) {
      console.error(`❌ 트림 ${trimId}를 찾지 못했습니다.`);
      return;
    }

    let trimMatched = true;
    Object.keys(expectedMatrix).forEach(key => {
      totalChecked++;
      const trimVal = targetTrim.priceMatrix[key];
      const chasalddaeVal = expectedMatrix[key];

      if (trimVal.rent === chasalddaeVal.rent && trimVal.lease === chasalddaeVal.lease) {
        totalMatched++;
      } else {
        trimMatched = false;
        console.error(`  - 조건 ${key} 불일치: trimVal=`, trimVal, 'chasalddaeVal=', chasalddaeVal);
      }
    });

    if (trimMatched) {
      console.log(`  ★ 27개 전 조건 100% 렌트/리스 가격 일치! ★`);
    }
  });

  console.log(`\n==========================================`);
  console.log(`총 ${totalChecked}개 조건 중 ${totalMatched}개 조건 1:1 일치 (${Math.round((totalMatched/totalChecked)*100)}%)`);

  // 분리 상품 삭제 확인
  const removedCount = await prisma.car.count({
    where: { slug: { in: ['tesla-new-model-3-8545', 'tesla-new-model-3-8546'] } }
  });
  console.log(`분리 상품 남아있는 수: ${removedCount}개 (0이어야 정상)`);

  await prisma.$disconnect();
}

main().catch(console.error);
