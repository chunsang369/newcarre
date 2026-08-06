const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const car = await prisma.car.findUnique({ where: { slug: 'tesla-new-model-3' } });
  if (!car) {
    console.error('Car not found');
    return;
  }

  const prices8545 = JSON.parse(fs.readFileSync('scratch/chasalddae_m3_8545_prices.json', 'utf8'));
  const prices8546 = JSON.parse(fs.readFileSync('scratch/chasalddae_m3_8546_prices.json', 'utf8'));
  const prices6343 = JSON.parse(fs.readFileSync('scratch/chasalddae_m3_6343_prices.json', 'utf8'));

  const trims = [];
  car.options.grades.forEach(g => {
    g.trims.forEach(t => trims.push(t));
  });

  const trimMap = {
    '8545': { name: 'Standard (4,199만원)', matrix: prices8545, trimObj: trims.find(t => t.trimId === '8545') },
    '8546': { name: 'Premium (5,299만원)', matrix: prices8546, trimObj: trims.find(t => t.trimId === '8546') },
    '6343': { name: 'Performance (5,999만원)', matrix: prices6343, trimObj: trims.find(t => t.trimId === '6343') }
  };

  const periods = ['36', '48', '60'];
  const depositTypes = [
    { key: 'PREPAY_30', name: '선수금 30%' },
    { key: 'DEPOSIT_30', name: '보증금 30%' },
    { key: 'NO_DEPOSIT', name: '무보증' }
  ];

  console.log('# Tesla New Model 3 전체 트림 및 계약조건별 1:1 대조표\n');

  for (const [trimId, data] of Object.entries(trimMap)) {
    console.log(`\n### 🚗 ${data.name} (trim_id: ${trimId})`);
    console.log(`| 기간 | 조건 | 구분 | 차살때 금액 | 제로카즈 금액 | 1:1 일치 여부 |`);
    console.log(`| :---: | :---: | :---: | :---: | :---: | :---: |`);

    for (const p of periods) {
      for (const d of depositTypes) {
        const matrixKey = `${p}_${d.key}_20000`;
        const expected = data.matrix[matrixKey];
        const actualMatrix = data.trimObj.priceMatrix[matrixKey];

        const rentMatch = expected?.rent === actualMatrix?.rent;
        const leaseMatch = expected?.lease === actualMatrix?.lease;

        const rentStr = expected?.rent ? expected.rent.toLocaleString() + '원' : '-';
        const rentActualStr = actualMatrix?.rent ? actualMatrix.rent.toLocaleString() + '원' : '-';
        const rentMatchTag = rentMatch ? '✅ 일치 (0원)' : '❌ 불일치';

        const leaseStr = expected?.lease ? expected.lease.toLocaleString() + '원' : '-';
        const leaseActualStr = actualMatrix?.lease ? actualMatrix.lease.toLocaleString() + '원' : '-';
        const leaseMatchTag = leaseMatch ? '✅ 일치 (0원)' : '❌ 불일치';

        console.log(`| ${p}개월 | ${d.name} | 렌트 | ${rentStr} | ${rentActualStr} | ${rentMatchTag} |`);
        console.log(`| ${p}개월 | ${d.name} | 리스 | ${leaseStr} | ${leaseActualStr} | ${leaseMatchTag} |`);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
