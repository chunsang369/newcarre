const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lr = await prisma.car.findUnique({ where: { slug: 'tesla-model-y-juniper-6342' } });
  const rwd = await prisma.car.findUnique({ where: { slug: 'tesla-model-y-juniper' } });

  console.log('=== Model Y Long Range 60m prices ===');
  if (lr && lr.priceMatrix) {
    const keys = [
      '60_PREPAY_30_10000',
      '60_DEPOSIT_30_10000',
      '60_NO_DEPOSIT_10000',
      '60_PREPAY_30_20000',
      '60_DEPOSIT_30_20000',
      '60_NO_DEPOSIT_20000',
      '60_PREPAY_30_30000',
      '60_DEPOSIT_30_30000',
      '60_NO_DEPOSIT_30000'
    ];
    keys.forEach(k => {
      console.log(`${k} : Rent = ${lr.priceMatrix[k]?.rent}원, Lease = ${lr.priceMatrix[k]?.lease}원`);
    });
  } else {
    console.log('LR not found or priceMatrix empty');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
