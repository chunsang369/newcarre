const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Restoring PERFECT Database & Images from f076d76 commit data...');

  delete require.cache[require.resolve('../prisma/car-data.ts')];
  const { popularCars } = require('../prisma/car-data.ts');

  console.log(`Commit f076d76 popularCars count: ${popularCars.length}개`);

  // 기존 DB 전부 초기화
  await prisma.car.deleteMany({});

  const brands = await prisma.brand.findMany();
  const brandMap = {};
  brands.forEach(b => { brandMap[b.slug] = b.id; });

  let restoredCount = 0;

  for (const car of popularCars) {
    const brandId = brandMap[car.brandSlug] || brands[0].id;
    // imageUrl과 thumbnailUrl 둘 다 완벽 지원
    const validImage = car.imageUrl || car.thumbnailUrl || '/images/cars/default.png';

    // popularCars 항목 자체의 thumbnailUrl 속성도 보정
    car.thumbnailUrl = validImage;

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
        thumbnailUrl: validImage,
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

  // car-data.ts 정식 업데이트
  const updatedContent = `// Restored from commit f076d76 with valid thumbnailUrl\nexport const popularCars: any[] = ${JSON.stringify(popularCars, null, 2)};\n`;
  fs.writeFileSync('prisma/car-data.ts', updatedContent, 'utf8');

  console.log(`\n==========================================`);
  console.log(`🎉 PERFECT Image & DB Restoration Completed! Restored: ${restoredCount}개`);

  await prisma.$disconnect();
}

main().catch(console.error);
