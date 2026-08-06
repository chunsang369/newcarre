const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log('Writing updated car-data.ts from Prisma DB...');
  const cars = await prisma.car.findMany({
    include: { brand: true }
  });

  console.log(`Total active cars in DB: ${cars.length}개`);

  const popularCars = cars.map((c, i) => ({
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

  const newContent = `// Auto-generated from Chasalddae 247 Master Sync\nexport const popularCars: any[] = ${JSON.stringify(popularCars, null, 2)};\n`;
  fs.writeFileSync('prisma/car-data.ts', newContent, 'utf8');
  console.log(`✅ Successfully saved ${popularCars.length} cars to prisma/car-data.ts!`);

  await prisma.$disconnect();
}

main().catch(console.error);
