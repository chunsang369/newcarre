const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

const brands = [
  { slug: 'hyundai', name: '현대', nameEn: 'Hyundai', isDomestic: true, sortOrder: 1 },
  { slug: 'kia', name: '기아', nameEn: 'Kia', isDomestic: true, sortOrder: 2 },
  { slug: 'genesis', name: '제네시스', nameEn: 'Genesis', isDomestic: true, sortOrder: 3 },
  { slug: 'renault-korea', name: '르노코리아', nameEn: 'Renault Korea', isDomestic: true, sortOrder: 4 },
  { slug: 'chevrolet', name: '쉐보레', nameEn: 'Chevrolet', isDomestic: true, sortOrder: 5 },
  { slug: 'kgm', name: 'KGM', nameEn: 'KGM', isDomestic: true, sortOrder: 6 },
  { slug: 'bmw', name: 'BMW', nameEn: 'BMW', isDomestic: false, sortOrder: 10 },
  { slug: 'mercedes-benz', name: '벤츠', nameEn: 'Mercedes-Benz', isDomestic: false, sortOrder: 11 },
  { slug: 'audi', name: '아우디', nameEn: 'Audi', isDomestic: false, sortOrder: 12 },
  { slug: 'mini', name: '미니', nameEn: 'MINI', isDomestic: false, sortOrder: 13 },
  { slug: 'volvo', name: '볼보', nameEn: 'Volvo', isDomestic: false, sortOrder: 14 },
  { slug: 'volkswagen', name: '폭스바겐', nameEn: 'Volkswagen', isDomestic: false, sortOrder: 15 },
  { slug: 'toyota', name: '토요타', nameEn: 'Toyota', isDomestic: false, sortOrder: 16 },
  { slug: 'lexus', name: '렉서스', nameEn: 'Lexus', isDomestic: false, sortOrder: 17 },
  { slug: 'honda', name: '혼다', nameEn: 'Honda', isDomestic: false, sortOrder: 18 },
  { slug: 'land-rover', name: '랜드로버', nameEn: 'Land Rover', isDomestic: false, sortOrder: 19 },
  { slug: 'jaguar', name: '재규어', nameEn: 'Jaguar', isDomestic: false, sortOrder: 20 },
  { slug: 'ford', name: '포드', nameEn: 'Ford', isDomestic: false, sortOrder: 21 },
  { slug: 'lincoln', name: '링컨', nameEn: 'Lincoln', isDomestic: false, sortOrder: 22 },
  { slug: 'jeep', name: '지프', nameEn: 'Jeep', isDomestic: false, sortOrder: 23 },
  { slug: 'gmc', name: 'GMC', nameEn: 'GMC', isDomestic: false, sortOrder: 24 },
  { slug: 'cadillac', name: '캐딜락', nameEn: 'Cadillac', isDomestic: false, sortOrder: 25 },
  { slug: 'peugeot', name: '푸조', nameEn: 'Peugeot', isDomestic: false, sortOrder: 26 },
  { slug: 'tesla', name: '테슬라', nameEn: 'Tesla', isDomestic: false, sortOrder: 27 },
  { slug: 'ds', name: 'DS', nameEn: 'DS', isDomestic: false, sortOrder: 28 },
  { slug: 'polestar', name: '폴스타', nameEn: 'Polestar', isDomestic: false, sortOrder: 29 },
  { slug: 'lucid', name: '루시드', nameEn: 'Lucid', isDomestic: false, sortOrder: 30 },
  { slug: 'lotus', name: '로터스', nameEn: 'Lotus', isDomestic: false, sortOrder: 31 },
  { slug: 'maserati', name: '마세라티', nameEn: 'Maserati', isDomestic: false, sortOrder: 32 },
  { slug: 'porsche', name: '포르쉐', nameEn: 'Porsche', isDomestic: false, sortOrder: 33 },
  { slug: 'bentley', name: '벤틀리', nameEn: 'Bentley', isDomestic: false, sortOrder: 34 },
  { slug: 'ferrari', name: '페라리', nameEn: 'Ferrari', isDomestic: false, sortOrder: 35 },
  { slug: 'lamborghini', name: '람보르기니', nameEn: 'Lamborghini', isDomestic: false, sortOrder: 36 },
  { slug: 'aston-martin', name: '애스턴마틴', nameEn: 'Aston Martin', isDomestic: false, sortOrder: 37 },
  { slug: 'mclaren', name: '맥라렌', nameEn: 'McLaren', isDomestic: false, sortOrder: 38 },
  { slug: 'rolls-royce', name: '롤스로이스', nameEn: 'Rolls-Royce', isDomestic: false, sortOrder: 39 },
  { slug: 'ineos', name: '이네오스', nameEn: 'Ineos', isDomestic: false, sortOrder: 40 },
  { slug: 'byd', name: 'BYD', nameEn: 'BYD', isDomestic: false, sortOrder: 41 },
];

function generatePriceMatrix(scrapedMatrix) {
  const periods = [36, 48, 60];
  const deposits = ['PREPAY_30', 'DEPOSIT_30', 'NO_DEPOSIT'];
  const mileages = [10000, 20000, 30000];

  const periodFactor = { 36: 1.0, 48: 0.82, 60: 0.70 };
  const mileageFactor = { 10000: 0.92, 20000: 1.0, 30000: 1.12 };

  const depositKeys = {
    PREPAY_30: 'prepay',
    DEPOSIT_30: 'deposit',
    NO_DEPOSIT: 'none',
  };

  const matrix = {};

  for (const p of periods) {
    for (const d of deposits) {
      for (const m of mileages) {
        const key = `${p}_${d}_${m}`;
        const dKey = depositKeys[d];
        
        const baseRent = scrapedMatrix?.rent?.[dKey] || 0;
        const baseLease = scrapedMatrix?.lease?.[dKey] || 0;

        const factor = periodFactor[p] * mileageFactor[m];
          
        matrix[key] = {
          rent: Math.round(baseRent * factor),
          lease: Math.round(baseLease * factor),
        };
      }
    }
  }
  return matrix;
}

async function main() {
  console.log('🌱 Starting DB seeding via node script...');

  const carDataText = fs.readFileSync('prisma/car-data.ts', 'utf8');
  const popularCarsMatch = carDataText.match(/export const popularCars\s*=\s*(\[[\s\S]*?\]);?\s*$/);
  const popularCars = JSON.parse(popularCarsMatch[1]);

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: brand,
      create: {
        ...brand,
        logoUrl: `/images/brands/${brand.slug}.png`,
      },
    });
  }
  console.log(`✅ ${brands.length} brands seeded`);

  for (const car of popularCars) {
    const brand = await prisma.brand.findUnique({ where: { slug: car.brandSlug } });
    if (!brand) continue;

    let priceMatrix = car.priceMatrix;
    if (priceMatrix && typeof priceMatrix.rent === 'object') {
        priceMatrix = generatePriceMatrix(car.priceMatrix);
    }

    await prisma.car.upsert({
      where: { slug: car.slug },
      update: {
        brandId: brand.id,
        modelName: car.modelName,
        trimName: car.trimName,
        year: car.year,
        category: car.category,
        fuelType: car.fuelType,
        basePrice: car.basePrice,
        priceMatrix,
        isPopular: car.isPopular,
        sortOrder: car.sortOrder,
        options: car.options || {},
        thumbnailUrl: car.imageUrl || `/images/cars/${car.slug}.png`,
      },
      create: {
        slug: car.slug,
        brandId: brand.id,
        modelName: car.modelName,
        trimName: car.trimName,
        year: car.year,
        category: car.category,
        fuelType: car.fuelType,
        basePrice: car.basePrice,
        thumbnailUrl: car.imageUrl || `/images/cars/${car.slug}.png`,
        galleryUrls: [],
        options: car.options || {},
        priceMatrix,
        isPopular: car.isPopular,
        sortOrder: car.sortOrder,
      },
    });
  }
  console.log(`✅ ${popularCars.length} cars seeded`);
  console.log('🎉 Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
