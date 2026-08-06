const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// lib/pricing.ts와 동일한 getSubsidyFactor 및 resolveTrimRepresentativePrice
function getSubsidyFactor(fuelType, slug) {
  const fType = fuelType?.toUpperCase() || "";
  if (fType === "ELECTRIC" || fType === "EV") {
    const s = slug?.toLowerCase() || "";
    if (s.includes("casper")) {
      return 0.298;
    } else if (s.includes("tesla") || s.includes("model-3") || s.includes("model-y")) {
      return 0.85;
    }
    return 0.88;
  }
  return 1.0;
}

function resolveTrimRepresentativePrice(car, trim, type, period = "36", deposit = "NO_DEPOSIT", mileage = "20000") {
  const matrix = typeof car.priceMatrix === "string" ? JSON.parse(car.priceMatrix) : car.priceMatrix;
  const key = `${period}_${deposit}_${mileage}`;
  const baseEntry = matrix?.[key] || { rent: 0, lease: 0 };
  let baseMonthly = baseEntry?.[type] || 0;

  const basePrice = car.basePrice || 0;
  const currentTrimPrice = Number(trim.price) || basePrice || 0;
  const trimPriceDiff = Math.max(0, currentTrimPrice - basePrice);

  const minThresholdRatio = deposit === "PREPAY_30" ? 0.0045 : 0.0075;
  const minAllowedMonthly = Math.floor(basePrice * minThresholdRatio);

  const subsidyFactor = getSubsidyFactor(car.fuelType, car.slug);

  let isFallback = false;
  if (!baseMonthly || baseMonthly < minAllowedMonthly || baseMonthly <= 20000 || car.slug?.includes("casper")) {
    isFallback = true;
    const baseRatio = type === "rent" ? 0.0165 : 0.0135;
    const fallbackBase = Math.floor(currentTrimPrice * baseRatio * subsidyFactor);
    baseMonthly = fallbackBase;
    if (deposit === "PREPAY_30") baseMonthly = Math.floor(fallbackBase * 0.66);
    if (deposit === "DEPOSIT_30") baseMonthly = Math.floor(fallbackBase * 0.88);
  }

  let ratio = 0.018; 
  if (deposit === "DEPOSIT_30") ratio = 0.015;
  if (deposit === "PREPAY_30") ratio = 0.009;
  
  const added = Math.floor(trimPriceDiff * ratio);
  
  let multiplier = 1.0;
  if (period === "48") multiplier = 0.90; 
  if (period === "60") multiplier = 0.82;

  let finalMonthly = 0;
  if (isFallback) {
    finalMonthly = Math.floor((baseMonthly + added) * multiplier);
  } else {
    finalMonthly = Math.floor(baseMonthly + (added * multiplier));
  }

  const offset = type === "rent" ? (trim.rentOffset || 0) : (trim.leaseOffset || 0);
  return finalMonthly + offset;
}

async function main() {
  const chasalddaePrices = JSON.parse(fs.readFileSync('scratch/chasalddae_model_y_api_prices.json', 'utf8'));
  
  const car = await prisma.car.findFirst({where: {modelName: 'Model Y Juniper'}});
  if (!car) {
    console.error('Model Y Juniper not found in DB!');
    await prisma.$disconnect();
    return;
  }

  // Premium Long Range 트림 가상 정의 (가격: 59,990,000원)
  const targetTrim = {
    name: 'Premium Long Range (자동)',
    price: 59990000,
    rentOffset: 0,
    leaseOffset: 0
  };

  const periods = ['36', '48', '60'];
  const distances = ['10000', '20000', '30000'];
  const conditions = ['PREPAY_30', 'DEPOSIT_30', 'NO_DEPOSIT'];

  console.log('| 조건 | 차살때 렌트 | 제로카즈 렌트 | 차이 | 차살때 리스 | 제로카즈 리스 | 차이 |');
  console.log('| --- | --- | --- | --- | --- | --- | --- |');

  for (const period of periods) {
    for (const mileage of distances) {
      for (const cond of conditions) {
        const key = `${period}_${cond}_${mileage}`;
        const chasalddae = chasalddaePrices[key] || { rent: null, lease: null };
        
        const hicarzRent = resolveTrimRepresentativePrice(car, targetTrim, 'rent', period, cond, mileage);
        const hicarzLease = resolveTrimRepresentativePrice(car, targetTrim, 'lease', period, cond, mileage);
        
        const rentDiff = chasalddae.rent ? hicarzRent - chasalddae.rent : 'N/A';
        const leaseDiff = chasalddae.lease ? hicarzLease - chasalddae.lease : 'N/A';

        const fmtChasalddaeRent = chasalddae.rent ? chasalddae.rent.toLocaleString() + '원' : '미지원';
        const fmtHicarzRent = hicarzRent.toLocaleString() + '원';
        const fmtChasalddaeLease = chasalddae.lease ? chasalddae.lease.toLocaleString() + '원' : '미지원';
        const fmtHicarzLease = hicarzLease.toLocaleString() + '원';

        console.log(`| ${key} | ${fmtChasalddaeRent} | ${fmtHicarzRent} | ${rentDiff} | ${fmtChasalddaeLease} | ${fmtHicarzLease} | ${leaseDiff} |`);
      }
    }
  }

  await prisma.$disconnect();
}

main();
