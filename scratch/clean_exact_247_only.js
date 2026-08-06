const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Cleaning DB to contain EXACT 247 Chasalddae Active Lineup...');

  const cleanList = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
  console.log(`Master clean list target count: ${cleanList.length}개`);

  // 차살때 247개 슬러그/아이디 목록
  const targetSlugs = new Set();
  cleanList.forEach(item => {
    if (item.slug) targetSlugs.add(item.slug);
  });

  const allDbCars = await prisma.car.findMany();
  
  // 차살때 cleanList에 속하는 차량들만 선택
  const activeCarIds = [];
  const inactiveCarIds = [];

  for (const car of allDbCars) {
    const isTarget = targetSlugs.has(car.slug) || 
      cleanList.some(c => c.trimId && car.options?.grades?.[0]?.trims?.[0]?.trimId === c.trimId);
    
    if (isTarget) {
      activeCarIds.push(car.id);
    } else {
      inactiveCarIds.push(car.id);
    }
  }

  console.log(`- Keep active: ${activeCarIds.length}개`);
  console.log(`- Deactivate/Remove: ${inactiveCarIds.length}개`);

  // 불필요 중복/레거시 차종 비활성화
  if (inactiveCarIds.length > 0) {
    await prisma.car.updateMany({
      where: { id: { in: inactiveCarIds } },
      data: { isActive: false }
    });
  }

  await prisma.car.updateMany({
    where: { id: { in: activeCarIds } },
    data: { isActive: true }
  });

  // car-data.ts 재생성 (활성 247개만 포함)
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

  const finalActive = await prisma.car.count({ where: { isActive: true } });
  console.log(`\n==========================================`);
  console.log(`🎉 Cleanup complete! Active DB Cars Count: ${finalActive}개`);

  await prisma.$disconnect();
}

main().catch(console.error);
