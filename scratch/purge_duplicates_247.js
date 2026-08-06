const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Purging Duplicates to keep EXACT 247 Active Cars...');

  const cleanList = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
  const cleanTrimIds = new Set(cleanList.map(c => String(c.trimId)));

  const allCars = await prisma.car.findMany();
  const keepIds = [];
  const removeIds = [];
  const seenTrimIds = new Set();

  for (const car of allCars) {
    let trimId = null;
    if (car.options && car.options.grades) {
      for (const g of car.options.grades) {
        for (const t of (g.trims || [])) {
          if (t.trimId) {
            trimId = String(t.trimId);
            break;
          }
        }
        if (trimId) break;
      }
    }

    if (trimId && cleanTrimIds.has(trimId) && !seenTrimIds.has(trimId)) {
      seenTrimIds.add(trimId);
      keepIds.push(car.id);
    } else {
      removeIds.push(car.id);
    }
  }

  console.log(`- Exactly matching Chasalddae cars to keep: ${keepIds.length}개`);
  console.log(`- Duplicate/Obsolete cars to deactivate: ${removeIds.length}개`);

  // 불필요 중복/레거시 비활성화
  await prisma.car.updateMany({
    where: { id: { in: removeIds } },
    data: { isActive: false }
  });

  await prisma.car.updateMany({
    where: { id: { in: keepIds } },
    data: { isActive: true }
  });

  // car-data.ts 재생성
  const activeCars = await prisma.car.findMany({
    where: { isActive: true },
    include: { brand: true }
  });

  const popularCars = activeCars.map((c, i) => ({
    slug: c.slug,
    brandId: c.brandId,
    brandSlug: c.brand?.slug || 'hyundai',
    modelName: c.modelName,
    trimName: c.trimName,
    year: c.year,
    category: c.category,
    fuelType: c.fuelType,
    basePrice: c.basePrice,
    thumbnailUrl: c.thumbnailUrl,
    galleryUrls: c.galleryUrls || [],
    options: c.options,
    priceMatrix: c.priceMatrix,
    isPopular: i < 30,
    isActive: true,
    sortOrder: i + 1,
    brand: {
      slug: c.brand?.slug || 'hyundai',
      name: c.brand?.name || '현대',
      isDomestic: true
    }
  }));

  const newContent = `// Auto-generated EXACT 247 Chasalddae active cars\nexport const popularCars: any[] = ${JSON.stringify(popularCars, null, 2)};\n`;
  fs.writeFileSync('prisma/car-data.ts', newContent, 'utf8');

  console.log(`🎉 Cleanup complete! Active DB Cars Count: ${activeCars.length}개`);

  await prisma.$disconnect();
}

main().catch(console.error);
