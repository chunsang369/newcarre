const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// lib/pricing.ts와 동일한 getSubsidyFactor 및 resolveTrimRepresentativePrice 로직
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

function resolveTrimRepresentativePrice(car, trim, type) {
  const matrix = typeof car.priceMatrix === "string" ? JSON.parse(car.priceMatrix) : car.priceMatrix;
  const key = "36_NO_DEPOSIT_20000";
  const baseEntry = matrix?.[key] || { rent: 0, lease: 0 };
  let baseMonthly = baseEntry?.[type] || 0;

  const basePrice = car.basePrice || 0;
  const currentTrimPrice = Number(trim.price) || basePrice || 0;
  const trimPriceDiff = Math.max(0, currentTrimPrice - basePrice);

  const minThresholdRatio = type === "rent" ? 0.0075 : 0.0065; // 무보증 임계율
  const minAllowedMonthly = Math.floor(basePrice * minThresholdRatio);

  const subsidyFactor = getSubsidyFactor(car.fuelType, car.slug);

  let isFallback = false;
  if (!baseMonthly || baseMonthly < minAllowedMonthly || baseMonthly <= 20000 || car.slug?.includes("casper")) {
    isFallback = true;
    const baseRatio = type === "rent" ? 0.0165 : 0.0135;
    const fallbackBase = Math.floor(currentTrimPrice * baseRatio * subsidyFactor);
    baseMonthly = fallbackBase; // NO_DEPOSIT 은 감액비율 없음
  } else {
    const added = Math.floor(trimPriceDiff * 0.018); // NO_DEPOSIT 기준 요율 0.018
    baseMonthly = baseMonthly + added;
  }

  const offset = type === "rent" ? (trim.rentOffset || 0) : (trim.leaseOffset || 0);
  return baseMonthly + offset;
}

async function main() {
  const palisade = await prisma.car.findUnique({
    where: { slug: 'hyundai-the-all-new-palisade' }
  });

  if (!palisade) {
    console.log("Palisade not found!");
    return;
  }

  console.log("Palisade Base Price:", palisade.basePrice);
  const options = typeof palisade.options === 'string' ? JSON.parse(palisade.options) : palisade.options;
  
  options.grades.forEach(grade => {
    console.log(`Grade: ${grade.name}`);
    grade.trims.forEach(trim => {
      const rentPrice = resolveTrimRepresentativePrice(palisade, trim, 'rent');
      const leasePrice = resolveTrimRepresentativePrice(palisade, trim, 'lease');
      console.log(`  Trim: ${trim.name} (Price: ${trim.price}) -> Rent: ${rentPrice}, Lease: ${leasePrice}`);
    });
  });

  await prisma.$disconnect();
}

main();
