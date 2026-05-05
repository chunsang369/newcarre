const fs = require('fs');

const detailsRaw = JSON.parse(fs.readFileSync('scratch/chasalddae_details.json', 'utf8'));

// Base price matrix logic from the previous logic
const depositFactor = { 0: 1.0, 30: 0.85, 60: 0.70 };
const periodFactor = { 36: 1.1, 48: 1.0, 60: 0.95 };
const mileageFactor = { 10000: 0.95, 20000: 1.0, 30000: 1.05 };

function generateFullPriceMatrix(baseRent, baseLease) {
  const matrix = {};
  for (const deposit of [0, 30, 60]) {
    for (const period of [36, 48, 60]) {
      for (const mileage of [10000, 20000, 30000]) {
        const key = `${deposit}_${period}_${mileage}`;
        const f = depositFactor[deposit] * periodFactor[period] * mileageFactor[mileage];
        matrix[key] = {
          rent: baseRent > 0 ? Math.round(baseRent * f) : 0,
          lease: baseLease > 0 ? Math.round(baseLease * f) : 0
        };
      }
    }
  }
  return matrix;
}

const slugify = (str) => {
   // Create simple slugs
   const mapping = {
      '현대': 'hyundai', '기아': 'kia', '제네시스': 'genesis',
      '르노코리아': 'renault-korea', '쉐보레': 'chevrolet', 'KG모빌리티': 'kgm',
      '벤츠': 'mercedes-benz', 'BMW': 'bmw', '아우디': 'audi',
      '폭스바겐': 'volkswagen', '푸조': 'peugeot', '미니': 'mini',
      '볼보': 'volvo', '랜드로버': 'land-rover', '테슬라': 'tesla',
      '토요타': 'toyota', '렉서스': 'lexus', '지프': 'jeep',
      '폴스타': 'polestar', '캐딜락': 'cadillac', '혼다': 'honda', 'BYD': 'byd'
   };
   // Model slug
   return str.toLowerCase().replace(/[^a-z0-9가-힣-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

const popularCars = [];

let order = 1;
for (const [trimId, car] of Object.entries(detailsRaw)) {
  
  const brandSlug = {
      '현대': 'hyundai', '기아': 'kia', '제네시스': 'genesis',
      '르노코리아': 'renault-korea', '쉐보레': 'chevrolet', 'KG모빌리티': 'kgm',
      '벤츠': 'mercedes-benz', 'BMW': 'bmw', '아우디': 'audi',
      '폭스바겐': 'volkswagen', '푸조': 'peugeot', '미니': 'mini',
      '볼보': 'volvo', '랜드로버': 'land-rover', '테슬라': 'tesla',
      '토요타': 'toyota', '렉서스': 'lexus', '지프': 'jeep',
      '폴스타': 'polestar', '캐딜락': 'cadillac', '혼다': 'honda', 'BYD': 'byd'
  }[car.brand] || car.brand;

  const modelSlug = slugify(car.modelName);
  
  // Categorization
  let category = 'SEDAN';
  const nameCheck = car.modelName + " " + (car.grades[0] ? car.grades[0].name : "");
  if (nameCheck.includes('SUV') || nameCheck.includes('싼타페') || nameCheck.includes('쏘렌토') || nameCheck.includes('투싼') || nameCheck.includes('스포티지') || nameCheck.includes('팰리세이드') || nameCheck.includes('GV') || nameCheck.match(/X[1-7]/) || nameCheck.includes('Q')) category = 'SUV';
  if (nameCheck.includes('카니발') || nameCheck.includes('스타리아')) category = 'VAN';
  if (nameCheck.includes('포터') || nameCheck.includes('봉고')) category = 'TRUCK';
  if (nameCheck.includes('해치백') || nameCheck.includes('클리오') || nameCheck.includes('미니')) category = 'HATCHBACK';
  
  let fuelType = 'GASOLINE';
  if (nameCheck.includes('디젤')) fuelType = 'DIESEL';
  if (nameCheck.includes('하이브리드') || nameCheck.includes('HEV')) fuelType = 'HYBRID';
  if (nameCheck.includes('전기') || nameCheck.includes('EV')) fuelType = 'ELECTRIC';
  if (nameCheck.includes('LPG') || nameCheck.includes('LPi')) fuelType = 'LPG';

  const basePrice = car.grades[0] && car.grades[0].trims[0] ? car.grades[0].trims[0].price : 30000000;
  
  // We need to reverse-calculate the base rent/lease at 0 deposit to fit the matrix
  // Chasalddae prices are for 30% deposit, 48m, 20k
  // So factor = 0.85 * 1.0 * 1.0 = 0.85
  // If monthlyRent = 358,000, then baseRent (0_48_20000) = 358000 / 0.85 = 421176
  const rentString = (car.summary || "").match(/렌트\s*([0-9,]+)/);
  const leaseString = (car.summary || "").match(/리스\s*([0-9,]+)/);
  
  let rentVal = 0; let leaseVal = 0;
  if (rentString) rentVal = parseInt(rentString[1].replace(/,/g, ''), 10);
  if (leaseString) leaseVal = parseInt(leaseString[1].replace(/,/g, ''), 10);
  
  const baseRentAtZero = Math.round(rentVal / 0.85);
  const baseLeaseAtZero = Math.round(leaseVal / 0.85);
  
  const priceMatrix = {
    "0_48_20000": {
      rent: baseRentAtZero,
      lease: baseLeaseAtZero
    }
  }; // Instead of just base, we generate full
  
  // Create detailedConfig
  const detailedConfig = {
    grades: [],
    trims: [],
    colorsExt: [],
    colorsInt: []
  };
  
  let gIdx = 1;
  let tIdx = 1;
  let oIdx = 1;
  
  const mappedOptions = car.options.map(opt => ({
     idx: oIdx++,
     title: opt.name,
     price: opt.price
  }));

  car.grades.forEach(g => {
     detailedConfig.grades.push({
         idx: gIdx,
         name: g.name
     });
     
     g.trims.forEach(t => {
         detailedConfig.trims.push({
             gradeIdx: gIdx,
             idx: tIdx++,
             name: t.name,
             price: t.price,
             options: mappedOptions // Shared options
         });
     });
     gIdx++;
  });
  
  // Fallback for missing colors so UI doesn't crash
  detailedConfig.colorsExt.push({ idx: 1, title: '화이트', price: 0 });
  detailedConfig.colorsInt.push({ idx: 1, title: '블랙', price: 0 });

  popularCars.push({
    slug: brandSlug + '-' + modelSlug,
    brandSlug: brandSlug,
    modelName: car.modelName,
    trimName: car.grades[0] ? car.grades[0].name.split(' ')[0] : '기본형',
    year: 2025,
    category,
    fuelType,
    basePrice,
    imageUrl: car.imageUrl,
    isPopular: true,
    sortOrder: order++,
    options: detailedConfig,
    priceMatrix: generateFullPriceMatrix(baseRentAtZero, baseLeaseAtZero)
  });
}

const fileContent = `// Auto-generated from Chasalddae crawling
export const popularCars = ${JSON.stringify(popularCars, null, 2)};
`;

fs.writeFileSync('prisma/car-data.ts', fileContent);
console.log('Successfully wrote prisma/car-data.ts');
