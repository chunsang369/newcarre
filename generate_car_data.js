const fs = require('fs');

const brandMap = {
  "현대": "hyundai",
  "기아": "kia",
  "제네시스": "genesis",
  "르노코리아": "renault-korea",
  "쉐보레": "chevrolet",
  "KGM": "kgm",
  "BMW": "bmw",
  "벤츠": "mercedes-benz",
  "아우디": "audi",
  "미니": "mini",
  "볼보": "volvo",
  "폭스바겐": "volkswagen",
  "토요타": "toyota",
  "렉서스": "lexus",
  "혼다": "honda",
  "랜드로버": "land-rover",
  "재규어": "jaguar",
  "포드": "ford",
  "링컨": "lincoln",
  "지프": "jeep",
  "GMC": "gmc",
  "캐딜락": "cadillac",
  "푸조": "peugeot",
  "테슬라": "tesla",
  "DS": "ds",
  "폴스타": "polestar",
  "루시드": "lucid",
  "로터스": "lotus",
  "마세라티": "maserati",
  "포르쉐": "porsche",
  "벤틀리": "bentley",
  "페라리": "ferrari",
  "람보르기니": "lamborghini",
  "애스턴마틴": "aston-martin",
  "맥라렌": "mclaren",
  "롤스로이스": "rolls-royce",
  "이네오스": "ineos",
  "BYD": "byd"
};

function parsePrice(p) {
  if (!p) return 0;
  return parseInt(p.replace(/[^0-9]/g, '')) || 0;
}

function getCategory(cat, name) {
  const n = name.toLowerCase();
  if (n.includes('suv')) return 'SUV';
  if (n.includes('rv')) return 'VAN';
  if (cat.includes('SUV')) return 'SUV';
  if (cat.includes('경차')) return 'HATCHBACK';
  return 'SEDAN';
}

const data = JSON.parse(fs.readFileSync('cars_final_database.json', 'utf8'));

const cars = data.map((c, i) => {
  const brandSlug = brandMap[c.brand] || 'etc';
  const modelName = c.name;
  const slug = `${brandSlug}-${modelName.replace(/\s+/g, '-').toLowerCase()}-${i}`;
  const rent = parsePrice(c.rentPrice);
  const lease = parsePrice(c.leasePrice);
  const fuel = c.fuels.length > 0 ? c.fuels[0] : 'GASOLINE';
  const cat = getCategory(c.category, modelName);

  return {
    brandSlug,
    slug,
    modelName,
    trimName: '기본형',
    year: 2025,
    category: cat,
    fuelType: fuel,
    basePrice: 0, // Not available in list
    monthlyRent: rent,
    monthlyLease: lease,
    isPopular: i < 50, // Just a guess for now
    sortOrder: i + 1,
    imageUrl: c.thumbnailUrl
  };
});

const output = `export const popularCars = ${JSON.stringify(cars, null, 2)};`;
fs.writeFileSync('prisma/car-data.ts', output, 'utf8');
console.log(`Generated car-data.ts with ${cars.length} cars.`);
