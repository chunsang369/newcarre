const fs = require('fs');

const SUV_KEYWORDS = [
  '팰리세이드', '싼타페', '투싼', '코나', '베뉴', '캐스퍼', '스포티지', '쏘렌토', '셀토스', '니로', '모하비', '넥쏘',
  'GV60', 'GV70', 'GV80', 'EV3', 'EV6', 'EV9', '아이오닉 5', '아이오닉 9', '코란도 이모션',
  '토레스', '티볼리', '코란도', '렉스턴', '액티언', '무쏘', 'QM6', '그랑 콜레오스', '아르카나',
  'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'iX', 'iX1', 'iX3',
  'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'G바겐', 'EQA', 'EQB', 'EQC', 'EQE SUV', 'EQS SUV', 
  'Q2', 'Q3', 'Q4', 'Q5', 'Q7', 'Q8', 'e-tron', 'Q4 e-tron',
  'XC40', 'XC60', 'XC90', 'C40', 'EX30', 'EX90', 
  'Cayenne', 'Macan', 'Levante', 'Grecale', 'DBX', 'Urus', 'Bentayga', 'Cullinan', 
  'Range Rover', 'Defender', 'Discovery', 'Sport', 'Evoque', 'Velar', 
  'Renegade', 'Compass', 'Cherokee', 'Wrangler', 'Gladiator', 
  'Explorer', 'Expedition', 'Bronco', 'Aviator', 'Navigator', 
  'Escalade', 'XT4', 'XT5', 'XT6', 'Lyriq', 
  '2008', '3008', '5008', 'Model Y', 'Model X'
];

const VAN_KEYWORDS = ['스타리아', '쏠라티', '카니발', '오딧세이', '시에나', 'V-Class', '스타렉스'];
const TRUCK_KEYWORDS = ['포터', '봉고', '콜로라도', '실버라도', '시에라', '칸', '스포츠'];
const HATCHBACK_KEYWORDS = ['모닝', '레이'];

function getCategory(name) {
  const upperName = name.toUpperCase();
  if (SUV_KEYWORDS.some(k => upperName.includes(k.toUpperCase()))) return 'SUV';
  if (VAN_KEYWORDS.some(k => upperName.includes(k.toUpperCase()))) return 'VAN';
  if (TRUCK_KEYWORDS.some(k => upperName.includes(k.toUpperCase()))) return 'TRUCK';
  if (HATCHBACK_KEYWORDS.some(k => upperName.includes(k.toUpperCase()))) return 'HATCHBACK';
  return 'SEDAN';
}

function parsePrice(str) {
  if (!str || str === '0원' || str === '') return 0;
  return parseInt(str.replace(/[^0-9]/g, '')) || 0;
}

const BASE_PRICES = {
  '디 올 뉴 팰리세이드': 43830000,
  '디 올 뉴 싼타페': 35460000,
  '더 뉴 투싼': 27710000,
  '디 올 뉴 코나': 24460000,
  '더 뉴 아반떼': 19970000,
  '디 올 뉴 그랜저': 37680000,
  'GV80': 69300000,
  'GV70': 50400000,
  'G80': 58900000,
  '카니발': 34700000,
  '쏘렌토': 35060000,
  '스포티지': 25370000,
  '셀토스': 21470000,
  '모닝': 13150000,
  '레이': 13900000
};

const BRAND_MAP = {
  '현대': 'hyundai', '기아': 'kia', '제네시스': 'genesis', '르노코리아': 'renault-korea',
  '쉐보레': 'chevrolet', 'KGM': 'kgm', 'BMW': 'bmw', '벤츠': 'mercedes-benz',
  '아우디': 'audi', '볼보': 'volvo', '렉서스': 'lexus', '폭스바겐': 'volkswagen',
  '미니': 'mini', '랜드로버': 'land-rover', '포르쉐': 'porsche', '포드': 'ford',
  '지프': 'jeep', '테슬라': 'tesla', '토요타': 'toyota', '혼다': 'honda'
};

async function generate() {
  const sourceData = JSON.parse(fs.readFileSync('cars_final_full_matrix.json', 'utf-8'));
  
  const popularCars = sourceData.map((car, idx) => {
    const brandSlug = BRAND_MAP[car.brand] || car.brand.toLowerCase().replace(/\s+/g, '-');
    const basePrice = BASE_PRICES[car.name] || 0;
    
    return {
      brandSlug,
      slug: `${brandSlug}-${car.name.replace(/\s+/g, '-')}`,
      modelName: car.name,
      trimName: '기본형',
      year: 2025,
      category: getCategory(car.name),
      fuelType: 'GASOLINE',
      basePrice,
      priceMatrix: {
        rent: {
          prepay: parsePrice(car.priceMatrix.rent.prepay),
          deposit: parsePrice(car.priceMatrix.rent.deposit),
          none: parsePrice(car.priceMatrix.rent.none)
        },
        lease: {
          prepay: parsePrice(car.priceMatrix.lease.prepay),
          deposit: parsePrice(car.priceMatrix.lease.deposit),
          none: parsePrice(car.priceMatrix.lease.none)
        }
      },
      isPopular: idx < 100,
      sortOrder: idx + 1,
      imageUrl: car.thumbnailUrl,
      options: {
        detailedConfig: {
          grades: [
            {
              idx: "g1",
              name: "기본 등급",
              trims: [
                {
                  idx: "t1",
                  name: "기본 트림",
                  price: basePrice,
                  colorsExt: [],
                  colorsInt: [],
                  options: []
                }
              ]
            }
          ]
        }
      }
    };
  });

  const content = `export const popularCars: any[] = ${JSON.stringify(popularCars, null, 2)};\n`;
  fs.writeFileSync('./prisma/car-data.ts', content);
  console.log('✅ Generated car-data.ts with base prices and detailedConfig placeholders.');
}

generate().catch(console.error);
