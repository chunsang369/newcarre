const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('Checking database results for Casper...');
  
  const casperBase = await prisma.car.findUnique({
    where: { slug: 'hyundai-the-new-casper' }
  });
  
  const casperElectric = await prisma.car.findUnique({
    where: { slug: 'hyundai-casper-electric' }
  });

  if (casperBase) {
    console.log('\n--- The New Casper (hyundai-the-new-casper) ---');
    console.log('BasePrice:', casperBase.basePrice);
    console.log('PriceMatrix keys count:', Object.keys(casperBase.priceMatrix).length);
    console.log('Sample (36_PREPAY_30_10000):', JSON.stringify(casperBase.priceMatrix['36_PREPAY_30_10000']));
    console.log('Sample (48_DEPOSIT_30_20000):', JSON.stringify(casperBase.priceMatrix['48_DEPOSIT_30_20000']));
    console.log('Sample (60_NO_DEPOSIT_10000):', JSON.stringify(casperBase.priceMatrix['60_NO_DEPOSIT_10000']));
  } else {
    console.log('❌ The New Casper not found!');
  }

  if (casperElectric) {
    console.log('\n--- Casper Electric (hyundai-casper-electric) ---');
    console.log('BasePrice:', casperElectric.basePrice);
    console.log('PriceMatrix keys count:', Object.keys(casperElectric.priceMatrix).length);
    console.log('Sample (36_PREPAY_30_10000):', JSON.stringify(casperElectric.priceMatrix['36_PREPAY_30_10000']));
    console.log('Sample (48_DEPOSIT_30_20000):', JSON.stringify(casperElectric.priceMatrix['48_DEPOSIT_30_20000']));
    console.log('Sample (60_NO_DEPOSIT_10000):', JSON.stringify(casperElectric.priceMatrix['60_NO_DEPOSIT_10000']));
  } else {
    console.log('❌ Casper Electric not found!');
  }

  await prisma.$disconnect();
}

verify().catch(console.error);
