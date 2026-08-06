const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Restoring Prisma DB Car table from Original car-data.ts...');

  delete require.cache[require.resolve('../prisma/car-data.ts')];
  const { popularCars } = require('../prisma/car-data.ts');

  console.log(`Original popularCars count: ${popularCars.length}개`);

  // 모든 기존 DB Car 데이터 삭제 후 원본 시딩
  await prisma.car.deleteMany({});

  const brands = await prisma.brand.findMany();
  const brandMap = {};
  brands.forEach(b => { brandMap[b.slug] = b.id; });

  let restoredCount = 0;

  for (const car of popularCars) {
    const brandId = brandMap[car.brandSlug] || brands[0].id;

    await prisma.car.create({
      data: {
        slug: car.slug,
        brandId: brandId,
        modelName: car.modelName,
        trimName: car.trimName || '2026년형',
        year: car.year || 2026,
        category: car.category || 'SEDAN',
        fuelType: car.fuelType || 'GASOLINE',
        basePrice: car.basePrice || 30000000,
        thumbnailUrl: car.thumbnailUrl || 'https://img.chasalddae.com/app/logo.png',
        galleryUrls: car.galleryUrls || [],
        options: car.options || {},
        priceMatrix: car.priceMatrix || {},
        isPopular: car.isPopular ?? true,
        isActive: car.isActive ?? true,
        sortOrder: car.sortOrder || (restoredCount + 1)
      }
    });

    restoredCount++;
  }

  console.log(`\n==========================================`);
  console.log(`🎉 PERFECT DB RESTORATION COMPLETED! Total Cars Restored: ${restoredCount}개`);

  await prisma.$disconnect();
}

main().catch(console.error);
